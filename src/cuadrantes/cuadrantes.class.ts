import { Injectable } from "@nestjs/common";
import * as moment from "moment";
import { CuadrantesDatabase } from "./cuadrantes.mongodb";
import { ObjectId } from "mongodb";
import { TCuadrante } from "./cuadrantes.interface";
import { Tienda } from "../tiendas/tiendas.class";
import { FacTenaMssql } from "../bbdd/mssql.class";
import {
  AusenciaInterface,
  TiposAusencia,
} from "../ausencias/ausencias.interface";
import { Trabajador } from "../trabajadores/trabajadores.class";
import { TrabajadorSql } from "../trabajadores/trabajadores.interface";

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
  ) {}

  async getCuadrantesIndividual(
    idTienda: number,
    idTrabajador: number,
    semana: number,
    year: number,
  ) {
    return await this.schCuadrantes.getCuadrantesIndividual(
      idTienda,
      idTrabajador,
      semana,
      year,
    );
  }

  async getCuadrantes(idTienda: number, semana: number) {
    const responsableTienda =
      await this.trabajadoresInstance.getResponsableTienda(idTienda);
    const equipoCompleto = await this.trabajadoresInstance.getSubordinadosById(
      responsableTienda.id,
    );

    const cuadrantes: TCuadrante[] = await this.schCuadrantes.getCuadrantes(
      idTienda,
      semana,
    );

    equipoCompleto.forEach((miembro) => {
      const cuadranteExistente = cuadrantes.find(
        (cuadrante) => cuadrante.idTrabajador === miembro.id,
      );

      if (!cuadranteExistente) {
        const nuevoCuadrante: TCuadrante = {
          _id: new ObjectId().toString(),
          idTrabajador: miembro.id,
          nombre: miembro.nombreApellidos,
          idTienda: idTienda,
          semana: semana,
          year: new Date().getFullYear(),
          arraySemanalHoras: [null, null, null, null, null, null, null],
          totalHoras: 0,
          enviado: false,
          historialPlanes: [],
        };

        cuadrantes.push(nuevoCuadrante);
      }
    });

    return cuadrantes;
  }

  async getTodo() {
    return await this.schCuadrantes.getTodo();
  }
  async getTiendas1Semana(semana: number) {
    return await this.schCuadrantes.getTiendas1Semana(semana);
  }

  async getSemanas1Tienda(idTienda: number) {
    return await this.schCuadrantes.getSemanas1Tienda(idTienda);
  }

  private async getPendientesEnvio() {
    return await this.schCuadrantes.getPendientesEnvio();
  }
  async getCuadranteSemanaTrabajador(idTrabajador: number, semana: number) {
    return await this.schCuadrantes.getCuadranteSemanaTrabajador(
      idTrabajador,
      semana,
    );
  }
  public async sincronizarConHit() {
    const cuadrantes = await this.getPendientesEnvio();
    const tiendas = await this.tiendasInstance.getTiendas();

    // Crear una función asíncrona para manejar la sincronización de cada cuadrante
    const sincronizarCuadrante = async (cuadrante) => {
      let query = "DECLARE @idTurno VARCHAR(255) = NULL";
      let subQuery = "";

      const sqlBorrar = this.schCuadrantes.borrarHistorial(cuadrante);
      const nombreTablaPlanificacion = this.schCuadrantes.nombreTablaSqlHit(
        cuadrante.semana,
      );

      for (let j = 0; j < cuadrante.arraySemanalHoras.length; j += 1) {
        if (
          cuadrante.arraySemanalHoras[j] &&
          !cuadrante.arraySemanalHoras[j].ausencia
        ) {
          const entrada = moment(
            cuadrante.arraySemanalHoras[j].horaEntrada,
            "HH:mm",
          );
          const salida = moment(
            cuadrante.arraySemanalHoras[j].horaSalida,
            "HH:mm",
          );
          const tipoTurno = entrada.format("A") === "AM" ? "M" : "T";

          subQuery += `
            SELECT @idTurno = NULL;
            SELECT TOP 1 @idTurno = idTurno from cdpTurnos WHERE horaInicio = '${
              cuadrante.arraySemanalHoras[j].horaEntrada
            }' AND horaFin = '${cuadrante.arraySemanalHoras[j].horaSalida}';
  
            IF @idTurno IS NOT NULL
              BEGIN
                DELETE FROM ${nombreTablaPlanificacion} WHERE idPlan = '${
            cuadrante.arraySemanalHoras[j].idPlan
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
                  '${cuadrante.arraySemanalHoras[j].idPlan}', 
                  CONVERT(datetime, '${moment()
                    .week(cuadrante.semana)
                    .weekday(j)
                    .format("DD/MM/YYYY")}', 103),
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
                  'De ${entrada.format("HH:mm")} a ${salida.format("HH:mm")}', 
                  '${entrada.format("HH:mm")}', 
                  '${salida.format("HH:mm")}', 
                  @idTurno, 
                  '#DDDDDD', 
                  'RESPONSABLE/DEPENDENTA
                  ');
                  DELETE FROM ${nombreTablaPlanificacion} WHERE idPlan = '${
            cuadrante.arraySemanalHoras[j].idPlan
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
                    '${cuadrante.arraySemanalHoras[j].idPlan}', 
                    CONVERT(datetime, '${moment()
                      .week(cuadrante.semana)
                      .weekday(j)
                      .format("DD/MM/YYYY")}', 103),
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

  // public async sincronizarConHit() {
  //   const cuadrantes = await this.getPendientesEnvio();
  //   const tiendas = await this.tiendasInstance.getTiendas();

  //   for (let i = 0; i < cuadrantes.length; i += 1) {
  //     let query = "DECLARE @idTurno VARCHAR(255) = NULL";
  //     let subQuery = "";

  //     const sqlBorrar = this.schCuadrantes.borrarHistorial(cuadrantes[i]);
  //     const nombreTablaPlanificacion = this.schCuadrantes.nombreTablaSqlHit(
  //       cuadrantes[i].semana,
  //     );

  //     for (let j = 0; j < cuadrantes[i].arraySemanalHoras.length; j += 1) {
  //       if (cuadrantes[i].arraySemanalHoras[j]) {
  //         const entrada = moment(
  //           cuadrantes[i].arraySemanalHoras[j].horaEntrada,
  //           "HH:mm",
  //         );
  //         const salida = moment(
  //           cuadrantes[i].arraySemanalHoras[j].horaSalida,
  //           "HH:mm",
  //         );
  //         const tipoTurno = entrada.format("A") === "AM" ? "M" : "T";

  //         subQuery += `

  //           SELECT @idTurno = NULL;
  //           SELECT TOP 1 @idTurno = idTurno from cdpTurnos WHERE horaInicio = '${
  //             cuadrantes[i].arraySemanalHoras[j].horaEntrada
  //           }' AND horaFin = '${cuadrantes[i].arraySemanalHoras[j].horaSalida}';

  //           IF @idTurno IS NOT NULL
  //             BEGIN
  //               INSERT INTO ${nombreTablaPlanificacion} (
  //                 idPlan,
  //                 fecha,
  //                 botiga,
  //                 periode,
  //                 idTurno,
  //                 usuarioModif,
  //                 fechaModif,
  //                 activo
  //               )
  //               VALUES (
  //                 '${cuadrantes[i].arraySemanalHoras[j].idPlan}',
  //                 CONVERT(datetime, '${moment()
  //                   .week(cuadrantes[i].semana)
  //                   .weekday(j)
  //                   .format("DD/MM/YYYY")}', 103),
  //                 ${this.tiendasInstance.convertirTiendaToExterno(
  //                   cuadrantes[i].idTienda,
  //                   tiendas,
  //                 )},
  //                 '${tipoTurno}',
  //                 @idTurno,
  //                 '365EquipoDeTrabajo',
  //                 GETDATE(),
  //                 1
  //               );
  //             END
  //           ELSE
  //               BEGIN
  //                 SELECT @idTurno = NEWID()
  //                 INSERT INTO cdpTurnos (
  //                   nombre,
  //                   horaInicio,
  //                   horaFin,
  //                   idTurno,
  //                   color,
  //                   tipoEmpleado
  //                 )
  //                 VALUES (
  //                   'De ${entrada.format("HH:mm")} a ${salida.format(
  //           "HH:mm",
  //         )}',
  //                   '${entrada.format("HH:mm")}',
  //                   '${salida.format("HH:mm")}',
  //                   @idTurno,
  //                   '#DDDDDD',
  //                   'RESPONSABLE/DEPENDENTA
  //                 ')
  //               END

  //       `;
  //       }
  //     }

  //     const resPlanes = await recHit("Fac_Tena", sqlBorrar + query + subQuery);
  //     if (resPlanes.rowsAffected.includes(1)) {
  //       await this.schCuadrantes.setCuadranteEnviado(cuadrantes[i]._id);
  //     } else throw Error("Fallo en la consulta");
  //   }

  //   return true;
  // }

  async saveCuadrante(cuadrante: TCuadrante, oldCuadrante: TCuadrante) {
    if (oldCuadrante) {
      cuadrante.historialPlanes = oldCuadrante.historialPlanes;
      cuadrante._id = oldCuadrante._id;
    }
    cuadrante.enviado = false;

    for (let i = 0; i < cuadrante.arraySemanalHoras.length; i += 1) {
      let update = false;
      if (cuadrante.arraySemanalHoras[i].bloqueado) {
        cuadrante.arraySemanalHoras[i] = oldCuadrante.arraySemanalHoras[i];
        continue;
      }

      if (cuadrante.arraySemanalHoras[i].idPlan) {
        update = true;
        if (
          !cuadrante.historialPlanes.includes(
            cuadrante.arraySemanalHoras[i].idPlan,
          )
        )
          cuadrante.historialPlanes.push(cuadrante.arraySemanalHoras[i].idPlan);
      }

      if (
        cuadrante.arraySemanalHoras[i].horaEntrada &&
        cuadrante.arraySemanalHoras[i].horaSalida
      ) {
        if (!update) {
          cuadrante.arraySemanalHoras[i].idPlan = new ObjectId().toString();
        }
      } else {
        cuadrante.arraySemanalHoras[i] = null;
        continue;
      }
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

  semanasEnRango(ausencia: AusenciaInterface) {
    const semanas: { year: number; week: number }[] = [];
    const inicio = moment(ausencia.fechaInicio);
    const final = moment(ausencia.fechaFinal);

    for (
      let currentDate = inicio;
      currentDate.isSameOrBefore(final);
      currentDate.add(1, "days")
    ) {
      const year = currentDate.year();
      const week = currentDate.isoWeek();

      if (!semanas.some((sw) => sw.year === year && sw.week === week)) {
        semanas.push({ year, week });
      }
    }

    return semanas;
  }

  private estaEnRango(
    fecha: moment.Moment,
    fechaInicio: moment.Moment,
    fechaFinal: moment.Moment,
  ): boolean {
    // Agrega un día a la fecha final para incluirlo en el rango
    fechaFinal.add(1, "days");
    return fecha.isSameOrAfter(fechaInicio) && fecha.isBefore(fechaFinal);
  }

  private crearAusencia(
    parcial: { dia: Date; horas: number },
    tipo: TiposAusencia,
  ): {
    tipo: TiposAusencia;
    parcial: boolean;
    horasParcial?: number;
  } {
    if (parcial) {
      return {
        tipo: tipo,
        parcial: true,
        horasParcial: parcial.horas,
      };
    }
    return {
      tipo: tipo,
      parcial: false,
    };
  }

  private actualizarCuadranteConAusencia(
    cuadrante: TCuadrante,
    ausencia: AusenciaInterface,
  ): void {
    cuadrante.arraySemanalHoras = cuadrante.arraySemanalHoras.map(
      (horas, index) => {
        const fecha = moment()
          .year(cuadrante.year)
          .isoWeek(cuadrante.semana)
          .day(index + 1);
        if (
          this.estaEnRango(
            fecha,
            moment(ausencia.fechaInicio),
            moment(ausencia.fechaFinal),
          )
        ) {
          const parcial = ausencia.arrayParciales.find((p) =>
            moment(p.dia).isSame(fecha, "day"),
          );
          return {
            horaEntrada: horas ? horas.horaEntrada : "",
            horaSalida: horas ? horas.horaSalida : "",
            idPlan: horas ? horas.idPlan : "",
            ausencia: this.crearAusencia(parcial, ausencia.tipo),
          };
        }
        return horas;
      },
    );
  }

  private crearNuevoCuadrante(
    trabajador: TrabajadorSql,
    semana: { week: number; year: number },
    ausencia: AusenciaInterface,
  ): TCuadrante {
    return {
      idTrabajador: ausencia.idUsuario,
      nombre: trabajador.nombreApellidos,
      idTienda: trabajador.idTienda,
      enviado: false,
      historialPlanes: [],
      totalHoras: null,
      semana: semana.week,
      year: semana.year,
      arraySemanalHoras: Array.from({ length: 7 }, (_, index) => {
        const fecha = moment()
          .year(semana.year)
          .isoWeek(semana.week)
          .day(index + 1);

        if (
          this.estaEnRango(
            fecha,
            moment(ausencia.fechaInicio),
            moment(ausencia.fechaFinal),
          )
        ) {
          const parcial = ausencia.arrayParciales.find((p) =>
            moment(p.dia).isSame(fecha, "day"),
          );
          return {
            horaEntrada: "",
            horaSalida: "",
            idPlan: "",
            ausencia: this.crearAusencia(parcial, ausencia.tipo),
          };
        }
        return null;
      }),
    };
  }

  async agregarAusencia(ausencia: AusenciaInterface): Promise<void> {
    const semanas = this.semanasEnRango(ausencia);
    const cuadrantes =
      semanas.length > 0
        ? await this.schCuadrantes.cuadrantesPorAusencia(ausencia, semanas)
        : [];
    const trabajador = await this.trabajadoresInstance.getTrabajadorBySqlId(
      ausencia.idUsuario,
    );

    const cuadrantesPorSemana = new Map(
      semanas.map((semana) => [
        `${semana.year}-${semana.week}`,
        cuadrantes.find(
          (cuadrante) =>
            cuadrante.year === semana.year && cuadrante.semana === semana.week,
        ),
      ]),
    );

    for (const semana of semanas) {
      const cuadrante = cuadrantesPorSemana.get(
        `${semana.year}-${semana.week}`,
      );

      if (cuadrante) {
        this.actualizarCuadranteConAusencia(cuadrante, ausencia);
        await this.schCuadrantes.actualizarCuadranteAusencia(cuadrante);
      } else {
        const nuevoCuadrante = this.crearNuevoCuadrante(
          trabajador,
          semana,
          ausencia,
        );
        await this.schCuadrantes.crearCuadranteAusencia(nuevoCuadrante);
      }
    }

    if (cuadrantes.length === 0) {
      const fechaInicio = moment(ausencia.fechaInicio);
      const fechaFinal = moment(ausencia.fechaFinal);

      while (fechaInicio.isSameOrBefore(fechaFinal, "day")) {
        const semana = {
          year: fechaInicio.year(),
          week: fechaInicio.isoWeek(),
        };

        if (!cuadrantesPorSemana.has(`${semana.year}-${semana.week}`)) {
          const nuevoCuadrante = this.crearNuevoCuadrante(
            trabajador,
            semana,
            ausencia,
          );
          await this.schCuadrantes.crearCuadranteAusencia(nuevoCuadrante);
          cuadrantesPorSemana.set(
            `${semana.year}-${semana.week}`,
            nuevoCuadrante,
          );
        }

        fechaInicio.add(1, "days");
      }
    }
  }
}
