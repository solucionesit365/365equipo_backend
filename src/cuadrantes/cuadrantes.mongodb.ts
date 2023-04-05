import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import { TCuadrante } from "./cuadrantes.interface";

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
}
