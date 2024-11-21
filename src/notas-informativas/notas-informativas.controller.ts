import { Controller, Post, UseGuards, Body, Get, Query } from "@nestjs/common";
import { AuthGuard } from "../guards/auth.guard";
import { NotasInformativasClass } from "./notas-informativas.class";
import { NotasInformativas } from "./notas-informativas.interface";
import { Notificaciones } from "../notificaciones/notificaciones.class";
import { TrabajadorService } from "../trabajadores/trabajadores.class";

@Controller("notas-informativas")
export class NotasInformativasController {
  constructor(
    private readonly notasInformativasInstance: NotasInformativasClass,
    private readonly trabajadores: TrabajadorService,
    private readonly notificaciones: Notificaciones,
  ) {}

  @UseGuards(AuthGuard)
  @Post("nuevaNotaInformativa")
  async nuevaNotaInformativa(@Body() nota: NotasInformativas) {
    try {
      if (typeof nota.fechaCreacion === "string") {
        nota.fechaCreacion = new Date(nota.fechaCreacion);
      }
      if (typeof nota.caducidad === "string") {
        nota.caducidad = new Date(nota.caducidad);
      }
      const usuariosCompletos = await this.trabajadores.getTrabajadores();

      // Filtrar solo los trabajadores que tienen los roles adecuados
      const trabajadoresConRolAdecuado = usuariosCompletos.filter(
        (trabajador) =>
          trabajador.roles.some((rol) => ["Tienda"].includes(rol.name)),
      );

      for (const trabajador of trabajadoresConRolAdecuado) {
        // Verificar que el idApp existe antes de llamar a getFCMToken
        if (trabajador.idApp) {
          const userToken = await this.notificaciones.getFCMToken(
            trabajador.idApp,
          );

          if (userToken && userToken.token) {
            try {
              await this.notificaciones.sendNotificationToDevice(
                userToken.token,
                "Nueva nota informativa",
                `${nota.titulo}`,
                "/notasInformativas",
              );
            } catch (error) {
              console.error(error);
            }
          }
        }
      }

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
