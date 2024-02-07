import { Controller, Get, UseGuards, Query } from "@nestjs/common";
import { SchedulerGuard } from "../guards/scheduler.guard";
import { ContratoService } from "./contrato.service";
import { AuthGuard } from "../guards/auth.guard";
import { DecodedIdToken } from "firebase-admin/auth";
import { User } from "../decorators/get-user.decorator";
import { TrabajadorService } from "../trabajadores/trabajadores.class";

@Controller("contrato")
export class ContratoController {
  constructor(
    private readonly contratoService: ContratoService,
    private readonly trabajadoresService: TrabajadorService,
  ) {}

  @UseGuards(SchedulerGuard)
  @Get("descargarHistoriaContratos")
  async descargarHistoriaContratos() {
    try {
      return {
        ok: true,
        data: await this.contratoService.descargarHistoriaContratos(),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getHistoricoContratos")
  async getHistoricoContratos(@User() user: DecodedIdToken) {
    try {
      const trabajadorCompleto =
        await this.trabajadoresService.getTrabajadorByAppId(user.uid);
      const resUser = await this.contratoService.getHistoricoContratos(
        trabajadorCompleto.dni,
      );

      return { ok: true, data: resUser };
    } catch (error) {
      console.log(error);
      return { ok: false, message: error.message };
    }
  }
}
