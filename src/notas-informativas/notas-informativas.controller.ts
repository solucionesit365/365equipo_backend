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

@Controller("notas-informativas")
export class NotasInformativasController {
  constructor(
    private readonly notasInformativasInstance: NotasInformativasClass,
  ) {}

  @UseGuards(AuthGuard)
  @Post("nuevaNotaInformativa")
  async nuevaIncidencia(@Body() nota: NotasInformativas) {
    try {
      if (typeof nota.fechaCreacion === "string") {
        nota.fechaCreacion = new Date(nota.fechaCreacion);
      }
      if (typeof nota.caducidad === "string") {
        nota.caducidad = new Date(nota.caducidad);
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
