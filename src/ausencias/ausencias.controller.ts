import { Body, Controller, Post, UseGuards, Get } from "@nestjs/common";
import { AusenciasService } from "./ausencias.class";
import { AuthGuard } from "../guards/auth.guard";
import { DateTime } from "luxon";
import { LoggerService } from "../logger/logger.service";
import { CrearAusenciaDto } from "./ausencias.dto";
import { CompleteUser } from "src/decorators/getCompleteUser.decorator";
import { Trabajador } from "@prisma/client";

@Controller("ausencias")
export class AusenciasController {
  constructor(
    private readonly ausenciasInstance: AusenciasService,
    private readonly loggerService: LoggerService,
  ) {}

  @UseGuards(AuthGuard)
  @Post("nueva")
  async addAusencia(
    @Body() req: CrearAusenciaDto,
    @CompleteUser() user: Trabajador,
  ) {
    try {
      const inicio = DateTime.fromISO(req.fechaInicio).toJSDate();
      const final = req.fechaFinal
        ? DateTime.fromISO(req.fechaFinal).toJSDate()
        : null;
      const revision = req.fechaRevision
        ? DateTime.fromISO(req.fechaRevision).toJSDate()
        : null;

      const ausencia = await this.ausenciasInstance.nuevaAusencia(
        req.idUsuario,
        req.nombre,
        req.dni,
        req.tipo,
        req.horasContrato,
        req.tienda,
        inicio,
        final,
        revision,
        req.comentario,
        req.completa,
        req.horas,
      );

      this.loggerService.create({
        action: "Crea una ausencia",
        name: `${user.nombreApellidos} para ${req.nombre}`,
        extraData: ausencia,
      });

      return {
        ok: true,
        data: ausencia,
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("deleteAusencia")
  async deleteAusencia(@Body() { idAusencia }) {
    try {
      const respAusencias = await this.ausenciasInstance.deleteAusencia(
        idAusencia,
      );
      if (respAusencias)
        return {
          ok: true,
          data: respAusencias,
        };

      throw Error("No se ha podido borrar la ausencia");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("updateAusencia")
  async updateAusencia(@Body() ausencia: any) {
    try {
      ausencia.fechaInicio = DateTime.fromFormat(
        ausencia.fechaInicio,
        "dd/MM/yyyy",
      ).toJSDate();
      ausencia.fechaFinal = DateTime.fromFormat(
        ausencia.fechaFinal,
        "dd/MM/yyyy",
      ).toJSDate();
      const respAusencia = await this.ausenciasInstance.updateAusencia(
        ausencia,
      );
      if (respAusencia)
        return {
          ok: true,
          data: respAusencia,
        };

      throw Error("No se ha podido modificar la ausencia");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("updateAusenciaResto")
  async updateAusenciaResto(@Body() ausencia: any) {
    try {
      ausencia.fechaInicio = DateTime.fromFormat(
        ausencia.fechaInicio,
        "dd/MM/yyyy",
      ).toJSDate();
      if (ausencia.fechaFinal)
        ausencia.fechaFinal = DateTime.fromFormat(
          ausencia.fechaFinal,
          "dd/MM/yyyy",
        ).toJSDate();
      if (ausencia.fechaRevision)
        ausencia.fechaRevision = DateTime.fromFormat(
          ausencia.fechaRevision,
          "dd/MM/yyyy",
        ).toJSDate();

      const respAusencia = await this.ausenciasInstance.updateAusenciaResto(
        ausencia,
      );
      if (respAusencia)
        return {
          ok: true,
          data: respAusencia,
        };

      throw Error("No se ha podido modificar la ausencia");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
  @UseGuards(AuthGuard)
  @Get("getAusencias")
  async getAusencias() {
    try {
      const respAusencias = await this.ausenciasInstance.getAusencias();
      if (respAusencias) return { ok: true, data: respAusencias };
      else throw Error("No se ha encontrado ninguna ausencia");
    } catch (error) {
      console.log(error);
    }
  }
}
