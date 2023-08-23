import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import {
  evaluacionesInterface,
} from "./evaluaciones.interface";

@Injectable()
export class EvaluacionesDatabase {
  constructor(private readonly mongoDbService: MongoDbService) { }

  async addplantilla(plantilla: evaluacionesInterface) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const evaluacionesCollect =
      db.collection<evaluacionesInterface>("evaluaciones");

    const resInsert = await evaluacionesCollect.insertOne(plantilla);

    if (resInsert.acknowledged) return resInsert.insertedId;

    throw Error("No se ha podido crear la nueva plantilla");
  }

  async getPlantillas(tipo: string) {
    console.log(tipo);

    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const evaluacionesCollect =
      db.collection<evaluacionesInterface>("evaluaciones");
    const response = await evaluacionesCollect.find({ tipo }).toArray();
    console.log(response);

    return response
  }
}
