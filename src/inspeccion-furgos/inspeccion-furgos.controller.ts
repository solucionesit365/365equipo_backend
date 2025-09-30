import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Delete,
  Param,
} from "@nestjs/common";
import { InspeccionFurgosClass } from "./inspeccion-furgos.class";
import { AuthGuard } from "../guards/auth.guard";
import { User } from "../decorators/get-user.decorator";
import { InspeccionFurgos } from "./inspeccion-furgos.dto";

@Controller("inspecciones-furgos")
export class InspeccionFurgosController {
  constructor(private readonly inspeccionesInstance: InspeccionFurgosClass) {}

  @UseGuards(AuthGuard)
  @Post("nueva")
  async nuevaInspeccion(@Body() inspeccion: InspeccionFurgos) {
    try {
      return {
        ok: true,
        data: await this.inspeccionesInstance.nuevaInspeccion(inspeccion),
      };
    } catch (err) {
      console.error(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("todas")
  async getAllInspecciones() {
    try {
      return {
        ok: true,
        data: await this.inspeccionesInstance.getAllInspecciones(),
      };
    } catch (err) {
      console.error(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("matricula/:matricula")
  async getInspeccionesByMatricula(@Param("matricula") matricula: string) {
    try {
      const inspecciones =
        await this.inspeccionesInstance.getInspeccionesByMatricula(matricula);
      return {
        ok: true,
        count: inspecciones ? inspecciones.length : 0,
        data: inspecciones,
      };
    } catch (err) {
      console.error(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("transportistas")
  async getTransportistas() {
    try {
      const transportistas =
        await this.inspeccionesInstance.getTransportistas();
      return {
        ok: true,
        count: transportistas ? transportistas.length : 0,
        data: transportistas,
      };
    } catch (err) {
      console.error(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  async borrarInspeccion(@Param("id") id: string) {
    try {
      return {
        ok: true,
        data: await this.inspeccionesInstance.borrarInspeccion(id),
      };
    } catch (err) {
      console.error(err);
      return { ok: false, message: err.message };
    }
  }
}
