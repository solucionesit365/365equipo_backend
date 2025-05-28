import { Controller, Get, UseGuards } from "@nestjs/common";
import { ContratoService } from "./contrato.service";
import { AuthGuard } from "../guards/auth.guard";
import { UserRecord } from "firebase-admin/auth";
import { User } from "../decorators/get-user.decorator";
import { TrabajadorService } from "../trabajador/trabajador.service";

@Controller("contrato")
export class ContratoController {
  constructor(
    private readonly contratoService: ContratoService,
    private readonly trabajadoresService: TrabajadorService,
  ) {}

  @UseGuards(AuthGuard)
  @Get("getHistoricoContratos")
  async getHistoricoContratos(@User() user: UserRecord) {
    const trabajadorCompleto =
      await this.trabajadoresService.getTrabajadorByAppId(user.uid);

    const resUser = await this.contratoService.getHistoricoContratos(
      trabajadorCompleto.dni,
    );

    return resUser;
  }
}
