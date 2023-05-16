import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import { NotificacionDto } from "./notificaciones.interface";

@Injectable()
export class NotificacionsBbdd {
  constructor(private readonly mongoDbService: MongoDbService) {}

  async saveToken(uid: string, token: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const notificaciones = db.collection<NotificacionDto>("notificaciones");

    const resSave = await notificaciones.insertOne({
      uid,
      token,
    });

    if (resSave.acknowledged) return resSave.insertedId;

    throw Error("No se ha podido guardar el token FCM");
  }
}
