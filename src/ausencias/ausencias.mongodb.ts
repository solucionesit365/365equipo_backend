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

  async deleteAusencia(idAusencia: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const ausenciasCollection = db.collection<AusenciaInterface>("ausencias");

    const resDelete = await ausenciasCollection.deleteOne({
      _id: new ObjectId(idAusencia),
    });

    return resDelete.acknowledged && resDelete.deletedCount > 0;
  }


  async getAusencias() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const ausenciasCollection = db.collection<AusenciaInterface>("ausencias");

    const respAusencia = await ausenciasCollection.find({}).toArray();

    return respAusencia;
  }

  async getAusenciasSincro() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const ausenciasCollection = db.collection<AusenciaInterface>("ausencias");

    const respAusencia = await ausenciasCollection
      .find({ enviado: { $ne: true } })
      .toArray();

    return respAusencia;
  }

  async marcarComoEnviada(id: ObjectId) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const ausenciasCollection = db.collection<AusenciaInterface>("ausencias");

    const respAusencia = await ausenciasCollection.updateOne(
      { _id: id },
      {
        $set: {
          enviado: true,
        },
      },
    );

    return respAusencia.acknowledged;
  }
}
