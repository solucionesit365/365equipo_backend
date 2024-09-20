import {
  Controller,
  Post,
  UseGuards,
  Headers,
  Body,
  Get,
  Query,
} from "@nestjs/common";
import { AuthGuard } from "../guards/auth.guard";
import { NotasInformativasClass } from "./notas-informativas.class";
import { NotasInformativas } from "./notas-informativas.interface";
import { Notificaciones } from "../notificaciones/notificaciones.class";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { User } from "../decorators/get-user.decorator";
import { UserRecord } from "firebase-admin/auth";

@Controller("notas-informativas")
export class NotasInformativasController {
  constructor(
    private readonly notasInformativasInstance: NotasInformativasClass,
    private readonly trabajadores: TrabajadorService,
    private readonly notificaciones: Notificaciones,
  ) {}

  @UseGuards(AuthGuard)
  @Post("nuevaNotaInformativa")
  async nuevaNotaInformativa(
    @Body() nota: NotasInformativas,
    @User() user: UserRecord,
  ) {
    try {
      if (typeof nota.fechaCreacion === "string") {
        nota.fechaCreacion = new Date(nota.fechaCreacion);
      }
      if (typeof nota.caducidad === "string") {
        nota.caducidad = new Date(nota.caducidad);
      }
      const usuarioCompleto = await this.trabajadores.getTrabajadorByAppId(
        user.uid,
      );
      const tieneRolAdecuado = usuarioCompleto.roles.some((rol) =>
        ["ModoTienda", "Dependienta", "Super_Admin"].includes(rol.name),
      );

      const userToken = await this.notificaciones.getFCMToken(
        usuarioCompleto.idApp,
      );
      if (tieneRolAdecuado) {
        // Si tienes el token fcmToken del dispositivo y quieres notificar al dispositivo directamente:
        if (userToken && userToken.token) {
          await this.notificaciones.sendNotificationToDevice(
            userToken.token, // Suponiendo que idApp es el fcmToken
            "Nueva nota informativa ",
            `${nota.titulo}`,
            "/notasInformativas",
          );
        } else {
          console.log("No se encontró fcmToken para este usuario.");
        }
      } else {
        console.log(
          "El usuario no tiene los roles necesarios para recibir la notificación.",
        );
      }

      console.log(usuarioCompleto);

      return {
        ok: true,
        data: await this.notasInformativasInstance.nuevaNotaInformativa(nota),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
  @UseGuards(AuthGuard)
  @Get("getNotasInformativas")
  async getNotasInformativas(@Query() { idTienda }) {
    try {
      const resGetNotaInformativa =
        await this.notasInformativasInstance.getNotasInformativas(
          Number(idTienda),
        );
      return {
        ok: true,
        data: resGetNotaInformativa,
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getAllNotasInformativas")
  async getAllNotasInformativas() {
    try {
      const resNotasInformativas =
        await this.notasInformativasInstance.getAllNotasInformativas();
      return {
        ok: true,
        data: resNotasInformativas,
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("borrarNotasInformativas")
  async borrarNotasInformativas(@Body() notas: NotasInformativas) {
    try {
      const resNotasInformativas =
        await this.notasInformativasInstance.borrarNotasInformativas(notas);
      return {
        ok: true,
        data: resNotasInformativas,
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
