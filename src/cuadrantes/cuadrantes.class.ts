import { Injectable } from "@nestjs/common";
import * as moment from "moment";
import { CuadrantesDatabase } from "./cuadrantes.mongodb";
import { ObjectId } from "mongodb";
import { TCuadrante } from "./cuadrantes.interface";
import { Tienda } from "../tiendas/tiendas.class";
import { FacTenaMssql } from "../bbdd/mssql.class";

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
  ) {}

  async getCuadrantesIndividual(
    idTienda: number,
    idTrabajador: number,
    semana: number,
  ) {
    return await this.schCuadrantes.getCuadrantesIndividual(
      idTienda,
      idTrabajador,
      semana,
    );
  }

  async getCuadrantes(idTienda: number, semana: number) {
    return await this.schCuadrantes.getCuadrantes(idTienda, semana);
  }

  async getTodo() {
    return await this.schCuadrantes.getTodo();
  }
  async getTiendas1Semana(semana: number) {
    return await this.schCuadrantes.getTiendas1Semana(semana);
  }

  async getSemanas1Tienda(idTienda: number){
    return await this.schCuadrantes.getSemanas1Tienda(idTienda)
  }

  private async getPendientesEnvio() {
    return await this.schCuadrantes.getPendientesEnvio();
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
        if (cuadrante.arraySemanalHoras[j]) {
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
                DELETE FROM ${nombreTablaPlanificacion} WHERE idPlan = '${cuadrante.arraySemanalHoras[j].idPlan}';
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
                  DELETE FROM ${nombreTablaPlanificacion} WHERE idPlan = '${cuadrante.arraySemanalHoras[j].idPlan}';
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
}