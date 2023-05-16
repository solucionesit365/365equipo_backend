import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import { NotificacionDto } from "./notificaciones.interface";

@Injectable()
export class NotificacionsBbdd {
  constructor(private readonly mongoDbService: MongoDbService) {}

  async saveToken(uid: string, token: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const notificaciones = db.collection<NotificacionDto>("notificaciones");

    const updateResult = await notificaciones.updateOne(
      { uid }, // Filtra por el uid
      { $set: { token } }, // Actualiza el token
      { upsert: true }, // Si el uid no existe, inserta un nuevo documento
    );

    if (updateResult.acknowledged) return true;

    throw Error("No se ha podido guardar o actualizar el token FCM");
  }
}
