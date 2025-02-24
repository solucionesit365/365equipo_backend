import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { DistribucionMensajes } from "./distribucion-mensajes.interface";
import { ObjectId } from "mongodb";
import { DateTime } from "luxon";

@Injectable()
export class DistribucionMensajesDatabase {
  constructor(private readonly mongoDbService: MongoService) {}

  async insertarMensajeDB(mensaje: DistribucionMensajes) {
    const db = (await this.mongoDbService.getConexion()).db();
    const disMensajesCollection = db.collection<DistribucionMensajes>(
      "distribucionMensajes",
    );

    const resInsert = await disMensajesCollection.insertOne(mensaje);

    if (resInsert.acknowledged) return resInsert.insertedId;

    throw Error("No se ha podido crear el mensaje");
  }

  async getAllMensajeDB() {
    const db = (await this.mongoDbService.getConexion()).db();
    const disMensajesCollection = db.collection<DistribucionMensajes>(
      "distribucionMensajes",
    );

    const response = await disMensajesCollection.find({}).toArray();

    return response;
  }

  async getOneMessage() {
    const db = (await this.mongoDbService.getConexion()).db();
    const disMensajesCollection = db.collection<DistribucionMensajes>(
      "distribucionMensajes",
    );

    return await disMensajesCollection.findOne({ activo: true });
  }

  async updateOneMensajes(id: string, activo: boolean) {
    const db = (await this.mongoDbService.getConexion()).db();
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

  async deleteMessage(id: string) {
    const db = (await this.mongoDbService.getConexion()).db();
    const disMensajesCollection = db.collection<DistribucionMensajes>(
      "distribucionMensajes",
    );

    const resDelete = await disMensajesCollection.deleteOne({
      _id: new ObjectId(id),
    });

    return resDelete.acknowledged && resDelete.deletedCount > 0;
  }

  async updateMensajeforDate(fechaInicio?: Date, fechaFin?: Date) {
    const db = (await this.mongoDbService.getConexion()).db();
    const disMensajesCollection = db.collection<DistribucionMensajes>(
      "distribucionMensajes",
    );

    // Buscar el mensaje activo
    const mensaje = await disMensajesCollection.findOne({ activo: true });

    if (!mensaje) {
      console.log("Mensaje activo no encontrado en la base de datos");
      return; //salir de la función si no hay ningun mensaje activo
    }

    //Verificar si las fechas no son undefined
    if (!fechaInicio) {
      fechaInicio = new Date(mensaje.fechaInicio);
    }

    if (!fechaFin) {
      fechaFin = new Date(mensaje.fechaFin);
    }

    const hoy = DateTime.now().startOf("day");
    const inicio = DateTime.fromJSDate(fechaInicio).startOf("day");
    const fin = DateTime.fromJSDate(fechaFin).startOf("day");

    if (hoy >= inicio && hoy <= fin) {
      return await disMensajesCollection.updateOne(
        {
          _id: new ObjectId(mensaje._id),
          activo: true,
        },
        {
          $set: {
            activo: false,
          },
        },
      );
    } else {
      console.log("Hoy no está dentro del rango de fechas especificado.");
      return null;
    }
  }
}
