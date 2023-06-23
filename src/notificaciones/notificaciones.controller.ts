import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Headers,
} from "@nestjs/common";
import { FirebaseMessagingService } from "../firebase/firebase-messaging.service";
import { Notificaciones } from "./notificaciones.class";
import { AuthGuard } from "../auth/auth.guard";
import { TokenService } from "../get-token/get-token.service";
import { AuthService } from "../firebase/auth";
import { log } from "console";

@Controller("notificaciones")
export class NotificacionesController {
  constructor(
    private readonly messagingService: FirebaseMessagingService,
    private readonly notificacionesInstance: Notificaciones,
    private readonly tokenService: TokenService,
    private readonly authInstance: AuthService,
  ) { }

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

  @Get("inAppNotifications")
  @UseGuards(AuthGuard)
  async getInAppNotifications(@Headers("authorization") authHeader: string) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);
      const usuario = await this.authInstance.getUserWithToken(token);
      return {
        ok: true,
        data: await this.notificacionesInstance.getInAppNotifications(
          usuario.uid,
        ),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("inAppNotificationsPendientes")
  @UseGuards(AuthGuard)
  async getInAppNotificationsPendientes(@Headers("authorization") authHeader: string) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);
      const usuario = await this.authInstance.getUserWithToken(token);
      const notificacionesPendientes = await this.notificacionesInstance.getInAppNotificationsPendientes(
        usuario.uid,
      );


      return {
        ok: true,
        count: notificacionesPendientes.length, // Devuelve el número de notificaciones pendientes
      }
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("getAllInAppNotifications")
  @UseGuards(AuthGuard)
  async getAllInAppNotifications(@Headers("authorization") authHeader: string) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);
      const usuario = await this.authInstance.getUserWithToken(token);
      return {
        ok: true,
        data: await this.notificacionesInstance.getAllInAppNotifications(
          usuario.uid,
        ),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Post("marcarComoLeida")
  async marcarComoLeida(
    @Headers("authorization") authHeader: string,
    @Body("id") id,
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);
      const usuario = await this.authInstance.getUserWithToken(token);
      return {
        ok: true,
        data: await this.notificacionesInstance.marcarComoLeida(
          id,
          usuario.uid,
        ),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Post("marcarComoNoLeida")
  async marcarComoNoLeida(
    @Headers("authorization") authHeader: string,
    @Body("id") id,
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);
      const usuario = await this.authInstance.getUserWithToken(token);
      return {
        ok: true,
        data: await this.notificacionesInstance.marcarComoNoLeida(
          id,
          usuario.uid,
        ),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
