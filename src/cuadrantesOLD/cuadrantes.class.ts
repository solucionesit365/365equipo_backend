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

  async getCuadranteCoordinadora(
    idTrabajador: number,
    arrayIdSubordinados: number[],
    fechaBusqueda: DateTime,
    idTienda: number,
  ): Promise<TCuadrante[]> {
    const fechaInicioSemana = fechaBusqueda.startOf("week");
    const fechaFinalSemana = fechaBusqueda.endOf("week");
    const cuadrantesSubordinados =
      await this.schCuadrantes.getCuadrantesSubordinados(
        arrayIdSubordinados,
        fechaInicioSemana,
        fechaFinalSemana,
      );
    const cuadrantesPropiosCoordi =
      await this.schCuadrantes.getCuadrantesIndividual(
        idTrabajador,
        fechaInicioSemana,
        fechaFinalSemana,
      );
    const cuadrantesExternosTienda = await this.schCuadrantes.getCuadrantes(
      idTienda,
      fechaInicioSemana,
      fechaFinalSemana,
    );

    const allCuadrantes = [
      ...cuadrantesSubordinados,
      ...cuadrantesPropiosCoordi,
      ...cuadrantesExternosTienda,
    ];

    const uniqueMap = new Map();

    allCuadrantes.forEach((cuadrante) => {
      const id = cuadrante._id.toString();
      uniqueMap.set(id, cuadrante);
    });

    const cuadrantesUnicos = Array.from(uniqueMap.values());

    console.log(allCuadrantes);

    return cuadrantesUnicos;
  }

  async getCuadranteSupervisora(
    idTienda: number,
    fechaBusqueda: DateTime,
  ): Promise<TCuadrante[]> {
    const fechaInicioSemana = fechaBusqueda.startOf("week");
    const fechaFinalSemana = fechaBusqueda.endOf("week");
    return await this.schCuadrantes.getCuadrantes(
      idTienda,
      fechaInicioSemana,
      fechaFinalSemana,
    );
  }

  // Cuadrantes 2.0
  async getTodo() {
    return await this.schCuadrantes.getTodo();
  }

  // Cuadrantes 2.0
  async getTiendas1Semana(fecha: DateTime) {
    const fechaInicio = fecha.startOf("week");
    const fechaFinal = fecha.endOf("week");

    return await this.schCuadrantes.getTiendas1Semana(fechaInicio, fechaFinal);
  }

  // Cuadrantes 2.0
  async getSemanas1Tienda(idTienda: number) {
    return await this.schCuadrantes.getSemanas1Tienda(idTienda);
  }

  async getTiendasSemana(idTienda: number, fecha: DateTime) {
    const fechaInicio = fecha.startOf("week");
    const fechaFinal = fecha.endOf("week");

    return await this.schCuadrantes.getTiendasSemana(
      Number(idTienda),
      fechaInicio,
      fechaFinal,
    );
  }
  // Cuadrantes 2.0
  private async getPendientesEnvio() {
    return await this.schCuadrantes.getPendientesEnvio();
  }

  // Cuadrantes 2.0
  async getCuadranteSemanaTrabajador(idTrabajador: number, fecha: DateTime) {
    const fechaInicio = fecha.startOf("week");
    const fechaFinal = fecha.endOf("week");

    return await this.schCuadrantes.getCuadrantesIndividual(
      idTrabajador,
      fechaInicio,
      fechaFinal,
    );
  }

  // Cuadrantes 2.0 (faltaría optimizar la velocidad de las consultas batch)
  public async sincronizarConHit() {
    const cuadrantes = await this.getPendientesEnvio();
    const tiendas = await this.tiendasInstance.getTiendas();

    // Crear una función asíncrona para manejar la sincronización de cada cuadrante
    const sincronizarCuadrante = async (cuadrante: TCuadrante) => {
      const query = "DECLARE @idTurno VARCHAR(255) = NULL";
      let subQuery = "";

      const sqlBorrar = this.schCuadrantes.borrarHistorial(cuadrante);
      const nombreTablaPlanificacion = this.schCuadrantes.nombreTablaSqlHit(
        cuadrante.inicio,
      );

      if (cuadrante && !cuadrante.ausencia) {
        const entrada = DateTime.fromJSDate(cuadrante.inicio);
        const salida = DateTime.fromJSDate(cuadrante.final);
        const tipoTurno = entrada.hour < 12 ? "M" : "T";

        subQuery += `
            SELECT @idTurno = NULL;
            SELECT TOP 1 @idTurno = idTurno from cdpTurnos WHERE horaInicio = '${entrada.toFormat(
              "yyyy-MM-dd HH:mm:ss",
            )}' AND horaFin = '${salida.toFormat("yyyy-MM-dd HH:mm:ss")}';
  
            IF @idTurno IS NOT NULL
              BEGIN
                DELETE FROM ${nombreTablaPlanificacion} WHERE idPlan = '${
          cuadrante.idPlan
        }';
                INSERT INTO ${nombreTablaPlanificacion} (
                  idPlan, 
                  fecha, 
                  botiga, 
                  periode, 
                  idTurno, 
                  usuarioModif, 
                  fechaModif, 
                  activo
                ) 
                VALUES (
                  '${cuadrante.idPlan}', 
                  '${entrada.toFormat("yyyy-MM-dd HH:mm:ss")}',
                  ${this.tiendasInstance.convertirTiendaToExterno(
                    cuadrante.idTienda,
                    tiendas,
                  )}, 
                  '${tipoTurno}', 
                  @idTurno, 
                  '365EquipoDeTrabajo', 
                  GETDATE(), 
                  1
                );
              END
            ELSE
              BEGIN
                SELECT @idTurno = NEWID()
                INSERT INTO cdpTurnos (
                  nombre, 
                  horaInicio, 
                  horaFin, 
                  idTurno, 
                  color, 
                  tipoEmpleado
                ) 
                VALUES (
                  'De ${entrada.toFormat("HH:mm")} a ${salida.toFormat(
          "HH:mm",
        )}', 
                  '${entrada.toFormat("HH:mm")}', 
                  '${salida.toFormat("HH:mm")}', 
                  @idTurno, 
                  '#DDDDDD', 
                  'RESPONSABLE/DEPENDENTA
                  ');
                  DELETE FROM ${nombreTablaPlanificacion} WHERE idPlan = '${
          cuadrante.idPlan
        }';
                  INSERT INTO ${nombreTablaPlanificacion} (
                    idPlan, 
                    fecha, 
                    botiga, 
                    periode, 
                    idTurno, 
                    usuarioModif, 
                    fechaModif, 
                    activo
                  ) 
                  VALUES (
                    '${cuadrante.idPlan}', 
                    '${entrada.toFormat("yyyy-MM-dd HH:mm:ss")}',
                    ${this.tiendasInstance.convertirTiendaToExterno(
                      cuadrante.idTienda,
                      tiendas,
                    )}, 
                    '${tipoTurno}', 
                    @idTurno, 
                    '365EquipoDeTrabajo', 
                    GETDATE(), 
                    1
                  );
              END
          `;
      }

      const resPlanes = await this.hitMssqlService.recHit(
        sqlBorrar + query + subQuery,
      );

      // if (resPlanes.rowsAffected.includes(1)) {
      // await this.schCuadrantes.setCuadranteEnviado(cuadrante._id);
      // } else {
      throw Error("Fallo en la consulta");
      // }
    };
    // Dividir los cuadrantes en lotes y procesarlos en paralelo con Promise.all

    const batchSize = 60; // Ajusta este valor según sea necesario
    for (let i = 0; i < cuadrantes.length; i += batchSize) {
      const batch = cuadrantes.slice(i, i + batchSize);
      await Promise.all(batch.map(sincronizarCuadrante));
    }

    return true;
  }

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

        // COMPROBAR AQUÍ POR QUÉ NO DEVUELVE NADA EN GUARDARCUADRANTES EN LA SIGUIENTE FUNCIÓN (SCHMONGO)
        // if (fechaCuadrante.hasSame(fechaOldCuadrante, "day")) {
        //   cuadrantes[i].ausencia = oldCuadrante[j].ausencia;
        //   if (
        //     fechaCuadrante.hasSame(fechaOldCuadrante, "hour") &&
        //     fechaCuadrante.hasSame(fechaOldCuadrante, "minute")
        //   ) {
        //     modificado = false;
        //   } else modificado = true;

        //   if (modificado) {
        //     // No hacer nada si hay ausencia completa, porque está bloqueado
        //     if (oldCuadrante[j].ausencia && oldCuadrante[j].ausencia.completa)
        //       break;

        //     cuadrantes[i].historialPlanes = oldCuadrante[j].historialPlanes;
        //     cuadrantes[i].historialPlanes.push(cuadrantes[i].idPlan);
        //     cuadrantes[i].enviado = false;

        //     cuadrantesModificables.push(cuadrantes[i]);
        //   } else break;
        // }
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
