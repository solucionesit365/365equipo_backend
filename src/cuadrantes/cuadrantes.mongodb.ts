import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import { TCuadrante } from "./cuadrantes.interface";
import * as moment from "moment";
import { recSolucionesClassic } from "src/bbdd/mssql";

moment.locale("es", {
  week: {
    dow: 1, // Lunes es el primer día de la semana
  },
});

@Injectable()
export class CuadrantesDatabase {
  constructor(private readonly mongoDbService: MongoDbService) {}

  async insertCuadrante(cuadrante: TCuadrante) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection("cuadrantes");
    const resInsert = await cuadrantesCollection.insertOne(cuadrante);
    if (resInsert.acknowledged) return resInsert.insertedId;
    return null;
  }

  async updateCuadrante(cuadrante: TCuadrante) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection("cuadrantes");
    const resInsert = await cuadrantesCollection.updateOne(
      { _id: cuadrante._id },
      {
        $set: {
          arraySemanalHoras: cuadrante.arraySemanalHoras,
          historialPlanes: cuadrante.historialPlanes,
          totalHoras: cuadrante.totalHoras,
          enviado: false,
        },
      },
    );
    return (
      resInsert.acknowledged &&
      (resInsert.modifiedCount > 0 || resInsert.upsertedCount > 0)
    );
  }

  async getCuadrantesIndividual(
    idTienda: number,
    idTrabajador: number,
    semana: number,
  ) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes");
    const resCuadrantes = await cuadrantesCollection.findOne({
      idTienda,
      semana,
      idTrabajador,
    });
    return resCuadrantes;
  }

  async getCuadrantes(idTienda: number, semana: number) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes");
    const resCuadrantes = await cuadrantesCollection
      .find({
        idTienda,
        semana,
      })
      .toArray();

    return resCuadrantes?.length > 0 ? resCuadrantes : [];
  }

  async getTodo() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes");
    const resCuadrantes = await cuadrantesCollection.find({}).toArray();

    return resCuadrantes?.length > 0 ? resCuadrantes : [];
  }

  async getPendientesEnvio() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes");
    const resCuadrantes = await cuadrantesCollection
      .find({ enviado: false })
      .toArray();

    return resCuadrantes?.length > 0 ? resCuadrantes : [];
  }

  public getMondayMoment(weekNumber: number) {
    const year = moment().year();
    const startOfWeek = moment().year(year).week(weekNumber).startOf("week");

    return startOfWeek;
  }

  public nombreTablaSqlHit(weekNumber: number) {
    const lunes = this.getMondayMoment(weekNumber);
    return `cdpPlanificacion_${lunes.format("YYYY_MM_DD")}`;
  }

  async borrarHistorial(cuadrantes: TCuadrante[]) {
    let sqlBorrar = "";

    for (let i = 0; i < cuadrantes.length; i += 1) {
      for (let j = 0; j < cuadrantes[i].historialPlanes.length; j += 1) {
        if (cuadrantes[i].historialPlanes[j])
          sqlBorrar += `DELETE FROM ${this.nombreTablaSqlHit(
            cuadrantes[i].semana,
          )} WHERE idPlan = '${cuadrantes[i].historialPlanes[j]}';`;
      }
    }

    await recSolucionesClassic("soluciones", sqlBorrar);
  }
}
