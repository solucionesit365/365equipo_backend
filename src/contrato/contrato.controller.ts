import { Controller, Get, UseGuards, Query } from "@nestjs/common";
import { SchedulerGuard } from "../scheduler/scheduler.guard";
import { ContratoService } from "./contrato.service";
import { TokenService } from "../get-token/get-token.service";
import { AuthGuard } from "../auth/auth.guard";

@Controller("contrato")
export class ContratoController {
  constructor(
    private readonly contratoService: ContratoService,
    private readonly tokenService: TokenService,
  ) {}

  @Get("descargarHistoriaContratos")
  @UseGuards(SchedulerGuard)
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
