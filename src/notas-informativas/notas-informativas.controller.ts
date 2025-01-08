import { Controller, Post, UseGuards, Body, Get, Query } from "@nestjs/common";
import { AuthGuard } from "../guards/auth.guard";
import { NotasInformativasClass } from "./notas-informativas.class";
import { NotasInformativas } from "./notas-informativas.interface";
import { Notificaciones } from "../notificaciones/notificaciones.class";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { LoggerService } from "../logger/logger.service";
import { CompleteUser } from "../decorators/getCompleteUser.decorator";
import { Trabajador } from "@prisma/client";
import { UserRecord } from "firebase-admin/auth";
import { User } from "../decorators/get-user.decorator";

@Controller("notas-informativas")
export class NotasInformativasController {
  constructor(
    private readonly notasInformativasInstance: NotasInformativasClass,
    private readonly trabajadores: TrabajadorService,
    private readonly notificaciones: Notificaciones,
    private readonly loggerService: LoggerService,
  ) {}

  @UseGuards(AuthGuard)
  @Post("nuevaNotaInformativa")
  async nuevaNotaInformativa(
    @Body() nota: NotasInformativas,
    @CompleteUser() user: Trabajador,
  ) {
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

      const resNuevaNota =
        await this.notasInformativasInstance.nuevaNotaInformativa(nota);

      if (resNuevaNota)
        this.loggerService.create({
          action: "Crea una nota informativa",
          name: user.nombreApellidos,
          extraData: nota,
        });

      return {
        ok: true,
        data: resNuevaNota,
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
  async borrarNotasInformativas(
    @Body() notas: NotasInformativas,
    @User() user: UserRecord,
  ) {
    try {
      const notaInformativaToDelete =
        await this.notasInformativasInstance.getNotasInformativasById(
          notas._id.toString(),
        );
      if (!notaInformativaToDelete) {
        throw new Error("Evaluacion no encontrada");
      }
      const resNotasInformativas =
        await this.notasInformativasInstance.borrarNotasInformativas(notas);
      if (resNotasInformativas) {
        // Obtener el nombre del usuario autenticado
        const usuarioCompleto = await this.trabajadores.getTrabajadorByAppId(
          user.uid,
        );
        const nombreUsuario = usuarioCompleto?.nombreApellidos || user.email;
        // Registro de la auditoría
        await this.loggerService.create({
          action: "Eliminar Notas Informativas",
          name: nombreUsuario,
          extraData: { evaluacionData: notaInformativaToDelete },
        });

        return {
          ok: true,
          data: resNotasInformativas,
        };
      }
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
