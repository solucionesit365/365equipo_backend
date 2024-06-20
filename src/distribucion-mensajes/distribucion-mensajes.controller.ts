import { Controller, Post, UseGuards, Body, Get, Query } from "@nestjs/common";
import { DistribucionMensajesClass } from "./distribucion-mensajes.class";
import { AuthGuard } from "../guards/auth.guard";
import { DistribucionMensajes } from "./distribucion-mensajes.interface";
import { SchedulerGuard } from "src/guards/scheduler.guard";

@Controller("distribucion-mensajes")
export class DistribucionMensajesController {
  constructor(
    private readonly DistribucionMensajesClass: DistribucionMensajesClass,
  ) {}

  @UseGuards(AuthGuard)
  @Post("nuevoMensaje")
  async insertarMensaje(@Body() mensaje) {
    try {
      const [diaInicio, mesInicio, añoInicio] = mensaje.fechaInicio
        .split("/")
        .map(Number);
      const inicio = new Date(añoInicio, mesInicio - 1, diaInicio);

      const [diaFin, mesFin, añoFin] = mensaje.fechaFin.split("/").map(Number);
      const fin = new Date(añoFin, mesFin - 1, diaFin);

      mensaje.fechaInicio = inicio;
      mensaje.fechaFin = fin;

      mensaje.createdAt = new Date();
      return {
        ok: true,
        data: await this.DistribucionMensajesClass.insertarMensaje(mensaje),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getAllMensajes")
  async getAllMensajes() {
    try {
      return {
        ok: true,
        data: await this.DistribucionMensajesClass.getAllMensajes(),
      };
    } catch (error) {}
  }

  @UseGuards(AuthGuard)
  @Get("getOneMessage")
  async getOneMessage() {
    try {
      return {
        ok: true,
        data: await this.DistribucionMensajesClass.getOneMessage(),
      };
    } catch (error) {}
  }
  @UseGuards(AuthGuard)
  @Post("updateOneMensaje")
  async updateOneMensaje(@Body() mensaje) {
    try {
      if (mensaje.activo) {
        const activos = await this.DistribucionMensajesClass.getOneMessage();
        if (activos) {
          return {
            ok: false,
          };
        } else {
          const response =
            await this.DistribucionMensajesClass.updateOneMensajes(
              mensaje._id,
              mensaje.activo,
            );
          return {
            ok: true,
            data: response,
          };
        }
      } else {
        const response = await this.DistribucionMensajesClass.updateOneMensajes(
          mensaje._id,
          mensaje.activo,
        );
        return {
          ok: true,
          data: response,
        };
      }
    } catch (error) {}
  }

  @UseGuards(SchedulerGuard)
  @Post("updateMensajeforDate")
  async updateMensajeforDate(@Body() mensaje) {
    return await this.DistribucionMensajesClass.updateMensajeforDate(
      mensaje.fechaInicio,
      mensaje.fechaFin,
    );
  }

  @UseGuards(AuthGuard)
  @Post("deleteMessage")
  async deleteMessage(@Query() { id }) {
    try {
      const deleteMensaje = await this.DistribucionMensajesClass.deleteMessage(
        id,
      );

      if (deleteMensaje) {
        return {
          ok: true,
          data: deleteMensaje,
        };
      }
    } catch (error) {
      console.log(error);
      return { ok: false, message: error.message };
    }
  }
}
