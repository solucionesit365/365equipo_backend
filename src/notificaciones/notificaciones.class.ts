import { Injectable } from "@nestjs/common";
import { NotificacionsDatabase } from "./notificaciones.mongodb";
import axios from "axios";
import { InAppNotification } from "./notificaciones.interface";

@Injectable()
export class Notificaciones {
  constructor(private readonly schNotificaciones: NotificacionsDatabase) {}
  async saveToken(uid: string, token: string) {
    return await this.schNotificaciones.saveToken(uid, token);
  }

  async sendMessage(titulo: string, body: string, fcmToken: string) {
    const resSend = await axios.post(
      "mi-end-point",
      {
        to: fcmToken,
        notification: {
          title: titulo,
          body: body,
        },
        data: {
          exampleKey: "exampleValue",
        },
      },
      {
        headers: {
          Authorization: `key=${process.env.FCM_SECRET}`,
          "Content-Type": "application/json",
        },
      },
    );
  }

  async newInAppNotification(notification: InAppNotification) {
    if (notification.uid)
      return await this.schNotificaciones.newInAppNotification(notification);
    return false;
  }

  async deleteInAppNotification(id: string) {
    return await this.schNotificaciones.deleteInAppNotification(id);
  }

  async getInAppNotifications(uid: string) {
    return await this.schNotificaciones.getInAppNotifications(uid);
  }

  async getInAppNotificationsPendientes(uid: string) {
    return await this.schNotificaciones.getInAppNotificationsPendientes(uid);
  }

  async getAllInAppNotifications(uid: string) {
    return await this.schNotificaciones.getAllInAppNotifications(uid);
  }

  async marcarComoLeida(id: string, uid: string) {
    return await this.schNotificaciones.marcarComoLeida(id, uid);
  }

  async marcarComoNoLeida(id: string, uid: string) {
    return await this.schNotificaciones.marcarComoNoLeida(id, uid);
  }
}
