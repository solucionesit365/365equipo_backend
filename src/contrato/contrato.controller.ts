import { Controller, Get, UseGuards, Query } from "@nestjs/common";
import { SchedulerGuard } from "../guards/scheduler.guard";
import { ContratoService } from "./contrato.service";
import { AuthGuard } from "../guards/auth.guard";

@Controller("contrato")
export class ContratoController {
  constructor(private readonly contratoService: ContratoService) {}

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
  async getHistoricoContratos(@Query() { dni }) {
    try {
      const resUser = await this.contratoService.getHistoricoContratos(dni);

      return { ok: true, data: resUser };
    } catch (error) {
      console.log(error);
      return { ok: false, message: error.message };
    }
  }
}
