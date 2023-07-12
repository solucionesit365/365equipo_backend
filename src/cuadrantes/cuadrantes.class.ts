import { Injectable } from "@nestjs/common";
import * as moment from "moment";
import { CuadrantesDatabase } from "./cuadrantes.mongodb";
import { ObjectId } from "mongodb";
import { TCuadrante, TCuadranteRequest } from "./cuadrantes.interface";
import { Tienda } from "../tiendas/tiendas.class";
import { FacTenaMssql } from "../bbdd/mssql.class";
import { AusenciaInterface } from "../ausencias/ausencias.interface";
import { Trabajador } from "../trabajadores/trabajadores.class";

import { FichajesValidados } from "../fichajes-validados/fichajes-validados.class";
import { DateTime } from "luxon";

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
    return await this.schCuadrantes.getCuadrantesIndividual(
      idTrabajador,
      fechaInicioBusqueda,
      fechaFinalBusqueda,
    );
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
      await this.fichajesValidadosInstance.getParaCuadrante(
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

  // Cuadrantes 2.0 (falta multitienda)
  async getCuadrantes(
    idTienda: number,
    fechaBusqueda: DateTime,
    idSql?: number,
  ) {
    const fechaInicioSemana = fechaBusqueda.startOf("week");
    const fechaFinalSemana = fechaBusqueda.endOf("week");

    const responsableTienda =
      await this.trabajadoresInstance.getResponsableTienda(idTienda);
    const equipoCompleto = await this.trabajadoresInstance.getSubordinadosById(
      responsableTienda.id,
      fechaInicioSemana,
    );

    if (idSql) {
      const usuarioActual =
        await this.trabajadoresInstance.getTrabajadorBySqlId(idSql);
      const horasContratoCurrentUser =
        await this.trabajadoresInstance.getHorasContratoById(
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
          fechaInicio: undefined,
          fechaFinal: undefined,
          ausencia: null,
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
        DateTime.fromJSDate(cuadrantes[i].fechaInicio),
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
      let query = "DECLARE @idTurno VARCHAR(255) = NULL";
      let subQuery = "";

      const sqlBorrar = this.schCuadrantes.borrarHistorial(cuadrante);
      const nombreTablaPlanificacion = this.schCuadrantes.nombreTablaSqlHit(
        cuadrante.fechaInicio,
      );

      if (cuadrante && !cuadrante.ausencia) {
        const entrada = DateTime.fromJSDate(cuadrante.fechaInicio);
        const salida = DateTime.fromJSDate(cuadrante.fechaFinal);
        const tipoTurno = entrada.hour < 12 ? "M" : "T";

        subQuery += `
            SELECT @idTurno = NULL;
            SELECT TOP 1 @idTurno = idTurno from cdpTurnos WHERE horaInicio = '${entrada.toISO()}' AND horaFin = '${salida.toISO()}';
  
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
                  '${entrada.toISO()}',
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
                    '${entrada.toISO()}',
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

  // Cuadrantes 2.0
  async saveCuadrante(cuadrante: TCuadrante, oldCuadrante: TCuadrante) {
    if (oldCuadrante) {
      cuadrante.historialPlanes = oldCuadrante.historialPlanes;
      cuadrante._id = oldCuadrante._id;
    }
    cuadrante.enviado = false;

    let update = false;

    if (cuadrante.idPlan) {
      update = true;
      if (!cuadrante.historialPlanes.includes(cuadrante.idPlan))
        cuadrante.historialPlanes.push(cuadrante.idPlan);
    }

    if (cuadrante.fechaInicio && cuadrante.fechaFinal) {
      if (!update) {
        cuadrante.idPlan = new ObjectId().toString();
      }
    } else {
      cuadrante = null;
    }

    if (oldCuadrante) {
      if (await this.schCuadrantes.updateCuadrante(cuadrante)) return true;
      throw Error("No se ha podido actualizar el cuadrante");
    } else {
      cuadrante.historialPlanes = [];
      const idCuadrante = await this.schCuadrantes.insertCuadrante(cuadrante);
      if (idCuadrante) return true;
      throw Error("No se ha podido insertar el cuadrante");
    }
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
        DateTime.fromJSDate(cuadrante.fechaInicio).hasSame(auxFecha, "day"),
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
          fechaInicio: null,
          fechaFinal: null,
          nombre: trabajador.nombreApellidos,
          totalHoras: 0,
          enviado: false,
          historialPlanes: [],
          horasContrato: trabajador.horasContrato,
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

  // Cuadrantes 2.0
  async copiarCuadrante(
    lunesOrigen: DateTime,
    lunesDestino: DateTime,
    idTienda: number,
  ) {
    const cuadrantesOrigen = await this.getCuadrantes(idTienda, lunesOrigen);
    const diferenciaSemanas = Math.abs(
      lunesOrigen.diff(lunesDestino, "weeks").weeks,
    );
    const cuadrantesDestino: TCuadrante[] = cuadrantesOrigen.map(
      (cuadrante) => {
        cuadrante._id = new ObjectId();
        cuadrante.fechaInicio = DateTime.fromJSDate(cuadrante.fechaInicio)
          .plus({ weeks: diferenciaSemanas })
          .toJSDate();
        cuadrante.fechaFinal = DateTime.fromJSDate(cuadrante.fechaFinal)
          .plus({ weeks: diferenciaSemanas })
          .toJSDate();
        cuadrante.enviado = false;
        return cuadrante;
      },
    );

    if (await this.schCuadrantes.insertCuadrantes(cuadrantesDestino))
      return true;
    else throw Error("No se han podido guardar las copias de los cuadrantes");
  }

  // Cuadrantes 2.0
  public getNuevosAndModificados(
    oldCuadrantes: TCuadrante[],
    newCuadrantes: TCuadranteRequest[],
  ): { nuevos: TCuadrante[]; modificados: TCuadrante[] } {
    const modificados: TCuadrante[] = [];
    const nuevos: TCuadrante[] = [];

    for (let i = 0; i < newCuadrantes.length; i += 1) {
      const cuadranteMismoDia = oldCuadrantes.find((cuadrante) => {
        if (
          DateTime.fromJSDate(cuadrante.fechaInicio).hasSame(
            DateTime.fromJSDate(new Date(newCuadrantes[i].fechaInicio)),
            "day",
          ) &&
          !cuadrante.ausencia
        ) {
          return true;
        }
      });

      if (cuadranteMismoDia) {
        cuadranteMismoDia.enviado = false;
        cuadranteMismoDia.fechaInicio = new Date(newCuadrantes[i].fechaInicio);
        cuadranteMismoDia.fechaFinal = new Date(newCuadrantes[i].fechaFinal);
        cuadranteMismoDia.historialPlanes.push(
          cuadranteMismoDia._id.toString(),
        );
        cuadranteMismoDia.ausencia = newCuadrantes[i].ausencia;
        cuadranteMismoDia.idTienda = newCuadrantes[i].idTienda;
        cuadranteMismoDia.totalHoras = newCuadrantes[i].totalHoras;

        modificados.push(cuadranteMismoDia);
      } else
        nuevos.push({
          _id: new ObjectId(),
          idPlan: new ObjectId().toString(),
          ausencia: newCuadrantes[i].ausencia,
          enviado: false,
          fechaInicio: new Date(newCuadrantes[i].fechaInicio),
          fechaFinal: new Date(newCuadrantes[i].fechaFinal),
          historialPlanes: [],
          horasContrato: newCuadrantes[i].horasContrato,
          idTienda: newCuadrantes[i].idTienda,
          idTrabajador: newCuadrantes[i].idTrabajador,
          nombre: newCuadrantes[i].nombre,
          totalHoras: newCuadrantes[i].totalHoras,
        });
    }
    return { nuevos, modificados };
  }
}
