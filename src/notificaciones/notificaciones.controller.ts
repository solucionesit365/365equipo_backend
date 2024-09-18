import { Controller, Post, Body, UseGuards, Get, Query } from "@nestjs/common";
import { Notificaciones } from "./notificaciones.class";
import { AuthGuard } from "../guards/auth.guard";
import { FirebaseService } from "../firebase/firebase.service";
import { UserRecord } from "firebase-admin/auth";
import { User } from "../decorators/get-user.decorator";

@Controller("notificaciones")
export class NotificacionesController {
  constructor(
    private readonly notificacionesInstance: Notificaciones,
    private readonly authInstance: FirebaseService,
  ) {}

  @UseGuards(AuthGuard)
  @Get("inAppNotifications")
  async getInAppNotifications(@User() user: UserRecord) {
    try {
      return {
        ok: true,
        data: await this.notificacionesInstance.getInAppNotifications(user.uid),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("inAppNotificationsPendientes")
  async getInAppNotificationsPendientes(@User() user: UserRecord) {
    try {
      const notificacionesPendientes =
        await this.notificacionesInstance.getInAppNotificationsPendientes(
          user.uid,
        );
      return {
        ok: true,
        count: notificacionesPendientes.length,
        notificaciones: notificacionesPendientes,
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getAllInAppNotifications")
  async getAllInAppNotifications(@User() user: UserRecord) {
    try {
      return {
        ok: true,
        data: await this.notificacionesInstance.getAllInAppNotifications(
          user.uid,
        ),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("marcarComoLeida")
  async marcarComoLeida(@User() user: UserRecord, @Body("id") id) {
    try {
      return {
        ok: true,
        data: await this.notificacionesInstance.marcarComoLeida(id, user.uid),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("marcarComoNoLeida")
  async marcarComoNoLeida(@User() user: UserRecord, @Body("id") id) {
    try {
      return {
        ok: true,
        data: await this.notificacionesInstance.marcarComoNoLeida(id, user.uid),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("saveTokenFCM")
  async saveToken(@Query() { token, uid }: { token: string; uid: string }) {
    try {
      return {
        ok: true,
        data: await this.notificacionesInstance.saveToken(uid, token),
      };
    } catch (error) {
      console.log(error);
      return { ok: false, message: error.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("testNotification")
  async testNotification(@User() user: UserRecord) {
    try {
      if (user) {
        const userToken = await this.notificacionesInstance.getFCMToken(
          user.uid,
        );
        if (userToken) {
          const message = this.notificacionesInstance.sendNotificationToDevice(
            userToken.token,
            "NOTIFICACIÓN CHULA",
            "Estos es una prueba que puede que funcione gaaaaa",
          );
          return {
            ok: true,
            data: message,
          };
        } else {
          return {
            ok: false,
            data: "El usuario no tiene token FCM, probablemente tiene notificaciones bloqueadas",
          };
        }
      } else {
        return {
          ok: false,
          data: "usuario no autenticado",
        };
      }
    } catch (error) {
      console.log(error);
      return { ok: false, message: error.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("testNotificationTopic")
  async testNotificationTopic() {
    try {
      return this.notificacionesInstance.sendNotificationToTopic(
        "NUEVO ANUNCIO DE 365OBRADOR",
        "Vacante disponible en el departamento de camaras.",
        "notificaciones_generales",
      );
    } catch (error) {
      console.log(error);
      return { ok: false, message: error.message };
    }
  }
}
