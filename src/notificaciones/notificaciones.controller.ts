import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Headers,
} from "@nestjs/common";
import { Notificaciones } from "./notificaciones.class";
import { AuthGuard } from "../guards/auth.guard";
import { FirebaseService } from "../firebase/firebase.service";
import { DecodedIdToken } from "firebase-admin/auth";
import { User } from "../decorators/get-user.decorator";

@Controller("notificaciones")
export class NotificacionesController {
  constructor(
    private readonly notificacionesInstance: Notificaciones,
    private readonly authInstance: FirebaseService,
  ) {}

  @UseGuards(AuthGuard)
  @Get("inAppNotifications")
  async getInAppNotifications(@User() user: DecodedIdToken) {
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
  async getInAppNotificationsPendientes(@User() user: DecodedIdToken) {
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
  async getAllInAppNotifications(@User() user: DecodedIdToken) {
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
  async marcarComoLeida(@User() user: DecodedIdToken, @Body("id") id) {
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
  async marcarComoNoLeida(@User() user: DecodedIdToken, @Body("id") id) {
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
}
