import { Injectable } from "@nestjs/common";
import { NotificacionsBbdd } from "./notificaciones.mongodb";

@Injectable()
export class Notificaciones {
  constructor(private readonly schNotificaciones: NotificacionsBbdd) {}
  async saveToken(uid: string, token: string) {
    return await this.schNotificaciones.saveToken(uid, token);
  }
}
