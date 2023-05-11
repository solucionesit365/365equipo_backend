import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import { TCuadrante } from "./cuadrantes.interface";
import * as moment from "moment";
import { ObjectId } from "mongodb";
import { AusenciaInterface } from "../ausencias/ausencias.interface";

moment.locale("es", {
  week: {
    dow: 1, // Lunes es el primer día de la semana
  },
});

@Injectable()
export class CuadrantesDatabase {
  constructor(private readonly mongoDbService: MongoDbService) { }

  async insertCuadrante(cuadrante: TCuadrante) {
    cuadrante._id = new ObjectId().toString();
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes");
    const resInsert = await cuadrantesCollection.insertOne(cuadrante);
    if (resInsert.acknowledged) return resInsert.insertedId;
    return null;
  }

  async updateCuadrante(cuadrante: TCuadrante) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes");
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
    year: number,
  ) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes");
    const resCuadrantes = await cuadrantesCollection.findOne({
      idTienda,
      semana,
      idTrabajador,
      year: Number(year),
    });

    return resCuadrantes;
  }

  async setCuadranteEnviado(idCuadrante: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes");
    const resEnviado = await cuadrantesCollection.updateOne(
      { _id: idCuadrante },
      {
        $set: {
          enviado: true,
        },
      },
    );

    return resEnviado.acknowledged;
  }

  async getCuadrantes(idTienda: number, semana: number) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes");
    const resCuadrantes = await cuadrantesCollection
      .find({
        idTienda: idTienda,
        semana: semana,
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
  async getTiendas1Semana(semana: number) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes");
    const resCuadrantes = await cuadrantesCollection
      .find({ semana: semana })
      .toArray();

    return resCuadrantes?.length > 0 ? resCuadrantes : [];
  }
  async getSemanas1Tienda(idTienda: number) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes");
    const resCuadrantes = await cuadrantesCollection
      .find({ idTienda: idTienda })
      .toArray();

    return resCuadrantes?.length > 0 ? resCuadrantes : [];
  }

  async getCuadranteSemanaTrabajador(idTrabajador: number, semana: number) {
    console.log("mondodb: " + idTrabajador + " - " + semana);

    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes");
    const resCuadrantes = await cuadrantesCollection
      .find({ idTrabajador: idTrabajador, semana: semana })
      .toArray();

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

  borrarHistorial(cuadrante: TCuadrante) {
    let sqlBorrar = "";

    for (let j = 0; j < cuadrante.historialPlanes.length; j += 1) {
      if (cuadrante.historialPlanes[j])
        sqlBorrar += `
          DELETE FROM ${this.nombreTablaSqlHit(
          cuadrante.semana,
        )} WHERE idPlan = '${cuadrante.historialPlanes[j]}';
          `;
    }

    return sqlBorrar;
    // console.log("sqlBorrar", sqlBorrar);
    // await recHit("Fac_Tena", sqlBorrar);
  }

  async cuadrantesPorAusencia(
    ausencia: AusenciaInterface,
    semanas: { year: number; week: number }[],
  ): Promise<TCuadrante[]> {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes");

    const cuadrantes = await cuadrantesCollection
      .find({
        idTrabajador: ausencia.idUsuario,
        $or: semanas.map(({ year, week }) => ({ year, semana: week })),
      })
      .toArray();

    return cuadrantes;
  }

  async actualizarCuadranteAusencia(cuadrante: TCuadrante): Promise<void> {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes");

    await cuadrantesCollection.updateOne(
      { _id: cuadrante._id },
      { $set: cuadrante },
    );
  }

  async crearCuadranteAusencia(cuadrante: TCuadrante): Promise<void> {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes");

    await cuadrantesCollection.insertOne(cuadrante);
  }
}
