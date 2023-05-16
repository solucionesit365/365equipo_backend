import { Injectable } from "@nestjs/common";
import { NotificacionsBbdd } from "./notificaciones.mongodb";
import axios from "axios";

@Injectable()
export class Notificaciones {
  constructor(private readonly schNotificaciones: NotificacionsBbdd) {}
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
}
