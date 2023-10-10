import { Injectable } from "@nestjs/common";
import * as moment from "moment";
import { CuadrantesDatabase } from "./cuadrantes.mongodb";
import { ObjectId, WithId } from "mongodb";
import { TCuadrante, TRequestCuadrante } from "./cuadrantes.interface";
import { Tienda } from "../tiendas/tiendas.class";
import { FacTenaMssql } from "../bbdd/mssql.class";
import { AusenciaInterface } from "../ausencias/ausencias.interface";
import { Trabajador } from "../trabajadores/trabajadores.class";

import { FichajesValidados } from "../fichajes-validados/fichajes-validados.class";
import { DateTime } from "luxon";
import { TrabajadorCompleto } from "../trabajadores/trabajadores.interface";

moment.locale("custom", {
  week: {
    dow: 1, // Lunes es el primer día de la semana
  },
});

@Injectable()
export class Cuadrantes {
  constructor(
    private readonly schCuadrantes: CuadrantesDatabase,
    private readonly tiendasInstance: Tienda,
    private readonly hitInstance: FacTenaMssql,
    private readonly trabajadoresInstance: Trabajador,
    private readonly fichajesValidadosInstance: FichajesValidados,
  ) {}

  // Cuadrante 2.0
  async getCuadrantesIndividual(
    idTrabajador: number,
    fechaInicioBusqueda: DateTime,
    fechaFinalBusqueda: DateTime,
  ) {
    const arrayCuadrantesTrabajador =
      await this.schCuadrantes.getCuadrantesIndividual(
        idTrabajador,
        fechaInicioBusqueda,
        fechaFinalBusqueda,
      );

    const nombreTrabajador = (
      await this.trabajadoresInstance.getTrabajadorBySqlId(idTrabajador)
    ).nombreApellidos;

    const resultado = await this.addEmptyDays(
      arrayCuadrantesTrabajador,
      idTrabajador,
      nombreTrabajador,
      fechaInicioBusqueda,
      fechaFinalBusqueda,
    );
    return resultado;
  }

  // Cuadrantes 2.0 INCOMPLETO!!!
  async borrarTurno(idTurno: string) {
    // FALTA AGREGAR UN TRIGGER PARA MODIFICARLO EN HIT TAMBIÉN !!!
    return await this.schCuadrantes.borrarTurno(idTurno);
  }

  private async addEmptyDays(
    arrayCuadrantes: WithId<TCuadrante>[],
    idTrabajador: number,
    nombreTrabajador: string,
    inicioSemana: DateTime,
    finalSemana: DateTime,
  ) {
    let diaActual = inicioSemana;
    const diasCompletos: WithId<TCuadrante>[] = [];

    const horasContrato =
      await this.trabajadoresInstance.getHorasContratoByIdNew(
        idTrabajador,
        inicioSemana,
      );

    while (diaActual <= finalSemana) {
      // Cuenta cuántas veces el día actual aparece en arrayCuadrantes
      const vecesDia = arrayCuadrantes.filter((cuadrante) =>
        DateTime.fromJSDate(cuadrante.inicio).hasSame(diaActual, "day"),
      ).length;

      if (vecesDia === 0) {
        // Si el día no está en arrayCuadrantes, lo añade con inicio y final a las 00:00
        diasCompletos.push({
          _id: new ObjectId(),
          enviado: false,
          historialPlanes: [],
          horasContrato: horasContrato,
          idPlan: new ObjectId().toJSON(),
          idTrabajador: idTrabajador,
          nombre: nombreTrabajador,
          totalHoras: 0,
          inicio: diaActual.toJSDate(),
          final: diaActual.toJSDate(),
          idTienda: null,
          ausencia: null,
          bolsaHorasInicial: null, // OJO, MIRAR ESTO 3.0
        });
      } else {
        // Si el día está en arrayCuadrantes, añade todos los cuadrantes de ese día
        const cuadrantesDia = arrayCuadrantes.filter((cuadrante) =>
          DateTime.fromJSDate(cuadrante.inicio).hasSame(diaActual, "day"),
        );
        diasCompletos.push(...cuadrantesDia);
      }

      diaActual = diaActual.plus({ days: 1 });
    }

    return diasCompletos;
  }

  // Cuadrantes 2.0
  async getBolsaHorasById(
    idSql: number,
    fecha: DateTime,
    horasContrato: number,
  ): Promise<number> {
    const { horasCuadranteTotal, horasMasMenos } = await this.getBolsaInicial(
      idSql,
      fecha,
    );

    return horasContrato - (horasCuadranteTotal + horasMasMenos);
  }

  // Cuadrantes 2.0
  async getBolsaInicial(idTrabajador: number, lunesActual: DateTime) {
    const lunesAnterior = lunesActual.minus({ days: 7 }).startOf("week");
    const domingoAnterior = lunesAnterior.minus({ days: 1 });

    const fichajesValidados =
      await this.fichajesValidadosInstance.getParaCuadranteNew(
        lunesAnterior,
        domingoAnterior,
        idTrabajador,
      );

    let horasCuadranteTotal = 0;
    let horasMasMenos = 0;

    for (let i = 0; i < fichajesValidados.length; i += 1) {
      horasMasMenos +=
        fichajesValidados[i].horasExtra +
        fichajesValidados[i].horasAprendiz +
        fichajesValidados[i].horasCoordinacion;
      horasCuadranteTotal += fichajesValidados[i].horasCuadrante;
    }

    return {
      horasCuadranteTotal,
      horasMasMenos,
    };
  }

  async recuentoTiendasIndividual(
    idTrabajador: number,
    inicioSemana: DateTime,
    finalSemana: DateTime,
  ): Promise<number[]> {
    const cuadrantesTrabajador =
      await this.schCuadrantes.getCuadrantesIndividual(
        idTrabajador,
        inicioSemana,
        finalSemana,
      );
    const tiendasSet = new Set<number>();

    for (const cuadrante of cuadrantesTrabajador) {
      tiendasSet.add(cuadrante.idTienda);
    }

    return [...tiendasSet];
  }

  async recuentoTiendasSubordinados(
    arrayTrabajadores: number[],
    inicioSemana: DateTime,
    finalSemana: DateTime,
  ): Promise<number[]> {
    const tiendasSet = new Set<number>();

    for (const idTrabajador of arrayTrabajadores) {
      const cuadrantesTrabajador =
        await this.schCuadrantes.getCuadrantesIndividual(
          idTrabajador,
          inicioSemana,
          finalSemana,
        );

      for (const cuadrante of cuadrantesTrabajador) {
        tiendasSet.add(cuadrante.idTienda);
      }
    }

    return [...tiendasSet];
  }

  async getCuadranteDependienta(idTrabajador: number, fechaBusqueda: DateTime) {
    const fechaInicioSemana = fechaBusqueda.startOf("week");
    const fechaFinalSemana = fechaBusqueda.endOf("week");
    const puestosTrabajo = await this.recuentoTiendasIndividual(
      idTrabajador,
      fechaInicioSemana,
      fechaFinalSemana,
    );
    const cuadrantes: TCuadrante[] = [];

    for (let i = 0; i < puestosTrabajo.length; i += 1) {
      cuadrantes.push(
        ...(await this.schCuadrantes.getCuadrantes(
          puestosTrabajo[i],
          fechaInicioSemana,
          fechaFinalSemana,
        )),
      );
    }

    return cuadrantes;
  }

  async getCuadranteCoordinadora(
    idTrabajador: number,
    arrayIdSubordinados: number[],
    fechaBusqueda: DateTime,
    idTienda: number,
  ): Promise<TCuadrante[]> {
    const fechaInicioSemana = fechaBusqueda.startOf("week");
    const fechaFinalSemana = fechaBusqueda.endOf("week");
    const puestosTrabajo = await this.recuentoTiendasSubordinados(
      arrayIdSubordinados,
      fechaInicioSemana,
      fechaFinalSemana,
    );
    const cuadrantes: TCuadrante[] = [];
    const puestosTrabajoIndividual = await this.recuentoTiendasIndividual(
      idTrabajador,
      fechaInicioSemana,
      fechaFinalSemana,
    );
    const puestosTotales: number[] = [
      ...new Set([
        ...puestosTrabajoIndividual,
        ...puestosTrabajo,
        ...[idTienda],
      ]),
    ];

    for (let i = 0; i < puestosTotales.length; i += 1) {
      cuadrantes.push(
        ...(await this.schCuadrantes.getCuadrantes(
          puestosTotales[i],
          fechaInicioSemana,
          fechaFinalSemana,
        )),
      );
    }

    return cuadrantes;
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

  // Vieja, después borrarla
  async getCuadrantesOld(
    idTienda: number,
    fechaBusqueda: DateTime,
    role: "DEPENDIENTA" | "COORDINADORA" | "SUPERVISORA",
    idSql?: number,
  ) {
    const fechaInicioSemana = fechaBusqueda.startOf("week");
    const fechaFinalSemana = fechaBusqueda.endOf("week");

    const responsableTienda =
      await this.trabajadoresInstance.getResponsableTienda(idTienda);
    const equipoCompleto =
      await this.trabajadoresInstance.getSubordinadosByIdNew(
        responsableTienda.id,
        fechaInicioSemana,
      );

    if (idSql) {
      const usuarioActual =
        await this.trabajadoresInstance.getTrabajadorBySqlId(idSql);
      const horasContratoCurrentUser =
        await this.trabajadoresInstance.getHorasContratoByIdNew(
          idSql,
          fechaInicioSemana,
        );
      usuarioActual.horasContrato = horasContratoCurrentUser;
      equipoCompleto.push(usuarioActual);
    }

    const cuadrantes: TCuadrante[] = await this.schCuadrantes.getCuadrantes(
      idTienda,
      fechaInicioSemana,
      fechaFinalSemana,
    );

    const cuadrantesVacios: TCuadrante[] = [];
    let hayUno = false;

    for (let i = 0; i < equipoCompleto.length; i += 1) {
      for (let j = 0; j < cuadrantes.length; j += 1) {
        if (equipoCompleto[i].id === cuadrantes[j].idTrabajador) {
          hayUno = true;
          cuadrantes[j]["horasContrato"] = equipoCompleto[i].horasContrato;

          break;
        }
      }

      if (!hayUno) {
        const nuevoCuadrante: TCuadrante = {
          _id: new ObjectId(),
          idTrabajador: equipoCompleto[i].id,
          nombre: equipoCompleto[i].nombreApellidos,
          idTienda: idTienda,
          totalHoras: 0,
          enviado: false,
          historialPlanes: [],
          horasContrato: equipoCompleto[i].horasContrato,
          idPlan: null,
          inicio: undefined,
          final: undefined,
          ausencia: null,
          bolsaHorasInicial: 0,
        };

        cuadrantesVacios.push(nuevoCuadrante);
      }
    }
    cuadrantes.push(...cuadrantesVacios);

    // Cuadrantes multitienda:
    // Falta añadir un tercer push, para los trabajadores que vienen de otro responsable,
    // pero que van a trabajar a esta tienda. Se deben mostrar todos los que vengan a trabajar
    // a la tienda aunque no sean subordinados de la tienda destino

    for (let i = 0; i < cuadrantes.length; i += 1) {
      cuadrantes[i]["bolsaHorasInicial"] = await this.getBolsaHorasById(
        cuadrantes[i].idTrabajador,
        DateTime.fromJSDate(cuadrantes[i].inicio),
        cuadrantes[i].horasContrato,
      );

      if (!cuadrantes[i].horasContrato) {
        const trabajadorCuadrante =
          await this.trabajadoresInstance.getTrabajadorBySqlId(
            cuadrantes[i].idTrabajador,
          );
        cuadrantes[i].horasContrato = trabajadorCuadrante.horasContrato;
      }
    }

    return cuadrantes;
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

      const resPlanes = await this.hitInstance.recHit(
        sqlBorrar + query + subQuery,
      );

      if (resPlanes.rowsAffected.includes(1)) {
        await this.schCuadrantes.setCuadranteEnviado(cuadrante._id);
      } else {
        throw Error("Fallo en la consulta");
      }
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
          inicio: null,
          final: null,
          nombre: trabajador.nombreApellidos,
          totalHoras: 0,
          enviado: false,
          historialPlanes: [],
          horasContrato: trabajador.horasContrato,
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

  getRole(
    usuario: TrabajadorCompleto,
  ): "DEPENDIENTA" | "COORDINADORA" | "SUPERVISORA" {
    if (usuario.coordinadora) {
      return usuario.idTienda ? "COORDINADORA" : "SUPERVISORA";
    } else if (usuario.idTienda) {
      return "DEPENDIENTA";
    }

    throw Error("Paso no autorizado. No es de ventas.");
  }
}
