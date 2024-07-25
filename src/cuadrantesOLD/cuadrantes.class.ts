import { Injectable, Inject, forwardRef } from "@nestjs/common";
import * as moment from "moment";
import { CuadrantesDatabase } from "./cuadrantes.mongodb";
import { ObjectId, WithId } from "mongodb";
import { TCuadrante } from "./cuadrantes.interface";
import { Tienda } from "../tiendas/tiendas.class";
import { HitMssqlService } from "../hit-mssql/hit-mssql.service";
import { AusenciaInterface } from "../ausencias/ausencias.interface";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { FichajesValidadosService } from "../fichajes-validadosOLD/fichajes-validados.class";
import { DateTime } from "luxon";
import { ContratoService } from "../contrato/contrato.service";
import { Trabajador } from "@prisma/client";
import { CopiarSemanaCuadranteDto } from "./cuadrantes.dto";

moment.locale("custom", {
  week: {
    dow: 1, // Lunes es el primer día de la semana
  },
});

@Injectable()
export class Cuadrantes {
  constructor(
    private readonly schCuadrantes: CuadrantesDatabase,
    private readonly contratoService: ContratoService,
    private readonly tiendasInstance: Tienda,
    private readonly hitMssqlService: HitMssqlService,
    @Inject(forwardRef(() => TrabajadorService))
    private readonly trabajadoresInstance: TrabajadorService,
    private readonly fichajesValidadosInstance: FichajesValidadosService,
  ) {}

  // Cuadrantes 2.0 guardado nuevo
  async saveCuadrante(cuadrantes: TCuadrante[], oldCuadrante: TCuadrante[]) {
    const cuadrantesModificables: TCuadrante[] = [];
    const cuadrantesParaAgregar: TCuadrante[] = [];
    let coincidencia: boolean;

    for (let i = 0; i < cuadrantes.length; i += 1) {
      const fechaCuadrante = DateTime.fromJSDate(cuadrantes[i].inicio);
      coincidencia = false;

      for (let j = 0; j < oldCuadrante.length; j += 1) {
        const fechaOldCuadrante = DateTime.fromJSDate(oldCuadrante[j].inicio);

        if (cuadrantes[i]._id.toString() === oldCuadrante[j]._id.toString()) {
          cuadrantesModificables.push(cuadrantes[i]);
          coincidencia = true;
          break;
        }
      }
      if (coincidencia === false) cuadrantesParaAgregar.push(cuadrantes[i]);
    }

    await this.schCuadrantes.guardarCuadrantes(
      cuadrantesModificables,
      cuadrantesParaAgregar,
    );
    return true;
  }

  // Cuadrantes 2.0
  async addAusenciaToCuadrantes(ausencia: AusenciaInterface) {
    const fechaInicio = DateTime.fromJSDate(ausencia.fechaInicio);
    const fechaFinal = DateTime.fromJSDate(ausencia.fechaFinal);
    const cuadrantesFinal: TCuadrante[] = [];
    const cuadrantesEnMedio = await this.schCuadrantes.getCuadrantesIndividual(
      ausencia.idUsuario,
      DateTime.fromJSDate(ausencia.fechaInicio),
      DateTime.fromJSDate(ausencia.fechaFinal),
    );
    const trabajador = await this.trabajadoresInstance.getTrabajadorBySqlId(
      ausencia.idUsuario,
    );

    let auxFecha = fechaInicio;
    while (auxFecha <= fechaFinal) {
      const cuadranteMolesto = cuadrantesEnMedio.find((cuadrante) =>
        DateTime.fromJSDate(cuadrante.inicio).hasSame(auxFecha, "day"),
      );
      if (cuadranteMolesto) {
        cuadranteMolesto.ausencia = {
          tipo: ausencia.tipo,
          completa: ausencia.completa,
          horas: ausencia.completa ? undefined : ausencia.horas,
          idAusencia: ausencia._id,
        };
        cuadrantesFinal.push(cuadranteMolesto);
      } else {
        cuadrantesFinal.push({
          _id: new ObjectId(),
          idTrabajador: ausencia.idUsuario,
          idPlan: new ObjectId().toString(),
          idTienda: trabajador.idTienda,
          inicio: auxFecha.toJSDate(),
          final: auxFecha.toJSDate(),
          nombre: trabajador.nombreApellidos,
          totalHoras: 0,
          enviado: false,
          historialPlanes: [],
          horasContrato:
            (Number(trabajador.contratos[0].horasContrato) * 40) / 100,
          bolsaHorasInicial: null, // OJO, MIRAR ESTO BIEN 3.0
          ausencia: {
            tipo: ausencia.tipo,
            completa: ausencia.completa,
            horas: ausencia.completa ? undefined : ausencia.horas,
            idAusencia: ausencia._id,
          },
        });
      }

      auxFecha = auxFecha.plus({ day: 1 });
    }

    await this.schCuadrantes.updateOrInsertManyCuadrantes(cuadrantesFinal);
  }

  getRole(usuario: Trabajador): "DEPENDIENTA" | "COORDINADORA" | "SUPERVISORA" {
    if (usuario.llevaEquipo) {
      return usuario.idTienda ? "COORDINADORA" : "SUPERVISORA";
    } else if (usuario.idTienda) {
      return "DEPENDIENTA";
    }

    throw Error("Paso no autorizado. No es de ventas.");
  }

  //Borrar las ausencias de cuadrantes2 se llama en ausencias.class
  async removeAusenciaFromCuadrantes(
    tipo: string,
    idUsuario: number,
    fechaInicio: Date,
    fechaFinal: Date,
  ) {
    return await this.schCuadrantes.removeAusenciaFromCuadrantes(
      tipo,
      idUsuario,
      fechaInicio,
      fechaFinal,
    );
  }

  //Borrar las vacaciones de cuadrantes2 se llama en solicitud-vacaciones.class
  async removeVacacionesFromCuadrantes(
    idUsuario: number,
    fechaInicio: Date,
    fechaFinal: Date,
  ) {
    return await this.schCuadrantes.removeVacacionesFromCuadrantes(
      idUsuario,
      fechaInicio,
      fechaFinal,
    );
  }

  /*
   * Lo que sería el cuadrante pero diario
   */
  async getTurnoDia(idTrabajador: number, fecha: DateTime) {
    const fechaInicio = fecha.startOf("day");
    const fechaFinal = fecha.endOf("day");

    const resTurno = await this.schCuadrantes.getTurnoDia(
      idTrabajador,
      fechaInicio,
      fechaFinal,
    );

    if (resTurno) return resTurno;
    return null;
  }

  async copiarSemanaCuadrante(reqCopiar: CopiarSemanaCuadranteDto) {
    const diaSemanaOrigen = DateTime.fromJSDate(reqCopiar.fechaSemanaOrigen);
    const diaSemanaDestino = DateTime.fromJSDate(reqCopiar.fechaSemanaDestino);

    const inicioSemanaOrigen = diaSemanaOrigen.startOf("week");
    const finalSemanaOrigen = diaSemanaOrigen.endOf("week");

    const inicioSemanaDestino = diaSemanaDestino.startOf("week");

    const diferenciaDias = inicioSemanaDestino.diff(
      inicioSemanaOrigen,
      "days",
    ).days;

    const cuadrantes = await this.schCuadrantes.getCuadrantes(
      reqCopiar.idTienda,
      inicioSemanaOrigen,
      finalSemanaOrigen,
    );

    if (cuadrantes.length > 0) {
      const cuadrantesFechasModificadas = cuadrantes.map((cuadrante) => {
        const fechaInicio = DateTime.fromJSDate(cuadrante.inicio);
        const fechaFinal = DateTime.fromJSDate(cuadrante.final);

        const nuevaFechaInicio = fechaInicio.plus({ days: diferenciaDias });
        const nuevaFechaFinal = fechaFinal.plus({ days: diferenciaDias });

        delete cuadrante._id;

        return {
          ...cuadrante,
          inicio: nuevaFechaInicio.toJSDate(),
          final: nuevaFechaFinal.toJSDate(),
          enviado: false,
        };
      });

      await this.schCuadrantes.insertCuadrantes(cuadrantesFechasModificadas);
    }

    return true;
  }

  // // Solo para migraciones
  // async getAllCuadrantes() {
  //   return await this.schCuadrantes.getAllCuadrantes();
  // }

  // async rectificarAllCuadrantes(cuadrantes: TCuadrante[]) {
  //   return await this.schCuadrantes.rectificarAllCuadrantes(cuadrantes);
  // }
  // final de migraciones
}
