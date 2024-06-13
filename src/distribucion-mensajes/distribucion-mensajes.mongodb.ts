import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { DistribucionMensajes } from "./distribucion-mensajes.interface";
import { ObjectId } from "mongodb";
import { DateTime } from "luxon";

@Injectable()
export class DistribucionMensajesDatabase {
  constructor(private readonly mongoDbService: MongoService) {}

  // async insertarMensajeDB(mensajes: DistribucionMensajes) {
  //   console.log("Gaaaaaaaaaa");

  //   const db = (await this.mongoDbService.getConexion()).db("soluciones");
  //   const disMensajesCollection = db.collection<DistribucionMensajes>(
  //     "distribucionMensajes",
  //   );
  //   const resInsert = await disMensajesCollection.insertOne(mensajes);
  //   if (resInsert.acknowledged) return resInsert.insertedId;
  //   return null;
  // }
  async insertarMensajeDB(mensaje: DistribucionMensajes) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const disMensajesCollection = db.collection<DistribucionMensajes>(
      "distribucionMensajes",
    );

    const resInsert = await disMensajesCollection.insertOne(mensaje);

    if (resInsert.acknowledged) return resInsert.insertedId;

    throw Error("No se ha podido crear el mensaje");
  }

  async getAllMensajeDB() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const disMensajesCollection = db.collection<DistribucionMensajes>(
      "distribucionMensajes",
    );

    const response = await disMensajesCollection.find({}).toArray();

    return response;
  }

  async getOneMessage() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const disMensajesCollection = db.collection<DistribucionMensajes>(
      "distribucionMensajes",
    );

    return await disMensajesCollection.findOne({ activo: true });
  }

  async updateOneMensajes(id: string, activo: boolean) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const disMensajesCollection = db.collection<DistribucionMensajes>(
      "distribucionMensajes",
    );
    return await disMensajesCollection.updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          activo: activo,
        },
      },
    );
  }
}
