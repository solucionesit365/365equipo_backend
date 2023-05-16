import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { FirebaseMessagingService } from "../firebase/firebase-messaging.service";
import { Notificaciones } from "./notificaciones.class";
import { AuthGuard } from "../auth/auth.guard";
import { TokenService } from "../get-token/get-token.service";

@Controller("notificaciones")
export class NotificacionesController {
  constructor(
    private readonly messagingService: FirebaseMessagingService,
    private readonly notificacionesInstance: Notificaciones,
  ) {}

  @Post("send")
  async sendNotification(@Body("token") token: string) {
    await this.messagingService.sendNotification(token);
    return 0;
  }

  @Post("saveTokenFCM")
  // @UseGuards(AuthGuard)
  async saveToken(@Body("token") token: string, @Body("uid") uid: string) {
    try {
      if (!token || !uid) throw Error("Faltan parámetros");

      return {
        ok: true,
        data: await this.notificacionesInstance.saveToken(uid, token),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
