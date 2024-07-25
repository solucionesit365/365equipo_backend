import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { NotasInformativas } from "./notas-informativas.interface";
import { ObjectId } from "mongodb";

@Injectable()
export class NotasInformativasDatabes {
  constructor(private readonly mongoDbService: MongoService) {}

  async nuevaNotaInformativa(nota: NotasInformativas) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const notasCollection =
      db.collection<NotasInformativas>("notasInformativas");
    const resInsert = await notasCollection.insertOne(nota);
    if (resInsert.acknowledged) return resInsert.insertedId;
    throw Error("No se ha podido insertar la nota informativa");
  }

  async getNotasInformativas(idTienda: number) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const notasCollection =
      db.collection<NotasInformativas>("notasInformativas");
    if (idTienda) {
      return await notasCollection
        .find({ tiendas: { $in: [idTienda, -1] } })
        .toArray();
    }
    return await notasCollection.find({}).toArray();
  }

  async borrarNotasInformativas(notas: NotasInformativas) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const notasCollection =
      db.collection<NotasInformativas>("notasInformativas");
    const resDelete = await notasCollection.deleteOne({
      _id: new ObjectId(notas._id),
    });
    if (resDelete.deletedCount > 0) return true;
    throw Error("No se ha podido borrar la(s) notas informativas");
  }
}
