import { Controller, UseGuards, Get } from "@nestjs/common";
import { CalculoNominasService } from "./calculo-nominas.service";
import { AuthGuard } from "../guards/auth.guard";

@Controller("calculo-nominas")
export class CalculoNominasController {
  constructor(private readonly calculoNominasService: CalculoNominasService) {}

  // @UseGuards(AuthGuard)
  @Get("pdis")
  async getPDISDependientas() {
    return this.calculoNominasService.calcularPDIS();
  }

  @UseGuards(AuthGuard)
  @Get("pprod")
  async getPProdDependientas() {
    return this.calculoNominasService.calcularPPROD();
  }
  @UseGuards(AuthGuard)
  @Get("pdom")
  async calcularPDOM() {
    return this.calculoNominasService.calcularPDOM();
  }
  // @UseGuards(AuthGuard)
  @Get("hcompl")
  async calcularHCOMPL() {
    return this.calculoNominasService.calcularHCOMPL();
  }

  @Get("all")
  async getCalculos() {
    return this.calculoNominasService.calcularTodo();
  }
}
