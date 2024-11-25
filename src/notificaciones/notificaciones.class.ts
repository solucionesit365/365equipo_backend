import { Injectable } from "@nestjs/common";
import { NotificacionsDatabase } from "./notificaciones.mongodb";
import axios from "axios";
import { InAppNotification } from "./notificaciones.interface";
import * as admin from "firebase-admin";

@Injectable()
export class Notificaciones {
  constructor(private readonly schNotificaciones: NotificacionsDatabase) {}

  async saveToken(uid: string, token: string) {
    const save = await this.schNotificaciones.saveToken(uid, token);
    if (save) {
      await admin
        .messaging()
        .subscribeToTopic(token, "notificaciones_generales");

      return {
        ok: true,
        data: "Token FCM guardado y suscrito a notificaciones_generales",
      };
    }
  }

  async sendMessage(titulo: string, body: string, fcmToken: string) {
    await axios.post(
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

  // Función para enviar notificación a un dispositivo
  async sendNotificationToDevice(
    fcmToken: string,
    title: string,
    message: string,
    url?: string,
  ) {
    const payload: admin.messaging.Message = {
      token: fcmToken, // Aquí va el token del dispositivo
      notification: {
        title: title,
        body: message,
      },
      data: {
        url: url || "/", // Acciones para cuando se hace clic en la notificación
      },
    };
    console.log("URL enviada:", url);
    try {
      const response = await admin.messaging().send(payload);
      console.log("Notificación enviada:", response);
      return response;
    } catch (error) {
      console.error("Error al enviar la notificación:", error);
    }
  }

  // Función para enviar notificación al topic notificaciones_notificaciones_generales
  async sendNotificationToTopic(title: string, message: string, topic: string) {
    const noti = {
      notification: {
        title: title,
        body: message,
      },
      topic: topic,
    };

    await admin
      .messaging()
      .send(noti)
      .then((res) => {
        console.log("Notificación enviada:", res);
      })
      .catch((error) => {
        console.error("Error al enviar notificación:", error);
      });
  }

  async getFCMToken(uid: string) {
    return await this.schNotificaciones.getFCMToken(uid);
  }
}
