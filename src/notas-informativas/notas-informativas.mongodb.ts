import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { NotasInformativas } from "./notas-informativas.interface";

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
}
