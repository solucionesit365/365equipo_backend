import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import { TCuadrante } from "./cuadrantes.interface";

@Injectable()
export class CuadrantesDatabase {
  constructor(private readonly mongoDbService: MongoDbService) {}

  async addCuadrante(cuadrante: TCuadrante) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection("cuadrantes");
    const resInsert = await cuadrantesCollection.insertOne(cuadrante);
    if (resInsert.acknowledged) return resInsert.insertedId;
    return null;
  }

  async getCuadrantes(idTienda: number, idTrabajador: number, semana: number) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const cuadrantesCollection = db.collection<TCuadrante>("cuadrantes");
    const resCuadrantes = await cuadrantesCollection
      .find({ idTienda, semana, idTrabajador })
      .toArray();

    if (resCuadrantes) return resCuadrantes;
    return [];
  }
}
