import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { VerificacionMFA } from "./verificacionmfa.interface";
import { ObjectId } from "mongodb";
@Injectable()
export class VerifiacacionDatabase {
  constructor(private readonly mongoDbService: MongoService) {}

  async nuevaVerificacionMFA(verificacion: VerificacionMFA) {
    const db = (await this.mongoDbService.getConexion()).db();
    const verificacionCollection =
      db.collection<VerificacionMFA>("verificacionMFA");

    const resInsert = await verificacionCollection.insertOne(verificacion);

    if (resInsert.acknowledged) return resInsert.insertedId;

    throw Error("No se ha podido crear la verificacion");
  }

  async verificacionMFA(uid: string, utilizado: boolean) {
    const db = (await this.mongoDbService.getConexion()).db();
    const verificacionCollection =
      db.collection<VerificacionMFA>("verificacionMFA");

    const restFind = await verificacionCollection
      .find({ uid, utilizado })
      .toArray();

    return restFind;
  }

  async deleteVerificacionMFA(_id: string) {
    const db = (await this.mongoDbService.getConexion()).db();
    const verificacionCollection =
      db.collection<VerificacionMFA>("verificacionMFA");
    const resDelete = await verificacionCollection.deleteOne({
      _id: new ObjectId(_id),
    });
    return resDelete.acknowledged && resDelete.deletedCount > 0;
  }
}
