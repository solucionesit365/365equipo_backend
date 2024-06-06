import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { DistribucionMensajes } from "./distribucion-mensajes.interface";
import { ObjectId } from "mongodb";
import { DateTime } from "luxon";

@Injectable()
export class DistribucionMensajesDatabase {
  constructor(private readonly mongoDbService: MongoService) {}

  // Cuadrantes 2.0
  async insertarMensaje(mensaje: DistribucionMensajes) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const disMensajesCollection = db.collection<DistribucionMensajes>(
      "distribucionMensajes",
    );
    const resInsert = await disMensajesCollection.insertOne(mensaje);
    if (resInsert.acknowledged) return resInsert.insertedId;
    return null;
  }
}
