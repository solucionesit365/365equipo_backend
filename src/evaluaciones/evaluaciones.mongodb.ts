import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import {
  evaluacionesInterface,
  TipoEvaluacion,
} from "./evaluaciones.interface";

@Injectable()
export class EvaluacionesDatabase {
  constructor(private readonly mongoDbService: MongoDbService) {}

  async addplantilla(plantilla: evaluacionesInterface) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const evaluacionesCollect =
      db.collection<evaluacionesInterface>("evaluaciones");

    const resInsert = await evaluacionesCollect.insertOne(plantilla);

    if (resInsert.acknowledged) return resInsert.insertedId;

    throw Error("No se ha podido crear la nueva plantilla");
  }

  async getPlantillas(tipo: TipoEvaluacion) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const evaluacionesCollect =
      db.collection<evaluacionesInterface>("evaluaciones");

    return await evaluacionesCollect.find({ tipo }).toArray();
  }
}
