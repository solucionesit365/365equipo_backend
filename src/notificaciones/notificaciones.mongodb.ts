import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import { InAppNotification, NotificacionDto } from "./notificaciones.interface";
import { ObjectId } from "mongodb";

@Injectable()
export class NotificacionsBbdd {
  constructor(private readonly mongoDbService: MongoDbService) { }

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

  async newInAppNotification(notification: InAppNotification) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const inAppNotifications =
      db.collection<InAppNotification>("inAppNotifications");
    notification.leido = false;
    const insertResult = await inAppNotifications.insertOne(notification);

    if (insertResult.acknowledged) return insertResult.insertedId;
    throw Error("No se ha podido insertar la nueva notificación in app");
  }

  async deleteInAppNotification(id: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const inAppNotifications =
      db.collection<InAppNotification>("inAppNotifications");

    const deleteResult = await inAppNotifications.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.acknowledged && deleteResult.deletedCount > 0) return true;
    throw Error("No se ha podido eliminar la notificación in app");
  }

  async getInAppNotifications(uid: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const inAppNotifications =
      db.collection<InAppNotification>("inAppNotifications");

    return await inAppNotifications.find({ uid, leido: false }).toArray();
  }

  async getAllInAppNotifications(uid: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const inAppNotifications =
      db.collection<InAppNotification>("inAppNotifications");

    return await inAppNotifications.find({ uid, leido: true }).toArray();
  }

  async marcarComoLeida(id: string, uid: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const inAppNotifications =
      db.collection<InAppNotification>("inAppNotifications");

    const updateResult = await inAppNotifications.updateOne(
      {
        _id: new ObjectId(id),
        uid,
      },
      {
        $set: { leido: true },
      },
    );

    if (updateResult.acknowledged && updateResult.modifiedCount > 0)
      return true;
    throw Error("No se ha podido marcar como leída la notificación");
  }

  async marcarComoNoLeida(id: string, uid: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const inAppNotifications =
      db.collection<InAppNotification>("inAppNotifications");

    const updateResult = await inAppNotifications.updateOne(
      {
        _id: new ObjectId(id),
        uid,
      },
      {
        $set: { leido: false },
      },
    );

    if (updateResult.acknowledged && updateResult.modifiedCount > 0)
      return true;
    throw Error("No se ha podido marcar como no leída la notificación");
  }
}
