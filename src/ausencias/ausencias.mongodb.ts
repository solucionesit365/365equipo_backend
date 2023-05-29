import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import { AusenciaInterface } from "./ausencias.interface";
import * as moment from "moment";
import { ObjectId } from "mongodb";

@Injectable()
export class AusenciasDatabase {
  constructor(private readonly mongoDbService: MongoDbService) { }

  async nuevaAusencia(ausencia: AusenciaInterface) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const ausenciasCollection = db.collection<AusenciaInterface>("ausencias");

    const resInsert = await ausenciasCollection.insertOne(ausencia);

    if (resInsert.acknowledged) return resInsert.insertedId;

    throw Error("No se ha podido crear la nueva ausencia");
  }

  async borrarAusencia(idAusencia: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const ausenciasCollection = db.collection<AusenciaInterface>("ausencias");

    const resBorrar = await ausenciasCollection.deleteOne({
      _id: new ObjectId(idAusencia),
    });

    if (resBorrar.acknowledged && resBorrar.deletedCount > 0) return true;
    return false;
  }
  async getAusencias() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const ausenciasCollection = db.collection<AusenciaInterface>("ausencias");

    const respAusencia = await ausenciasCollection.find({}).toArray()

    return respAusencia;

  }
}
