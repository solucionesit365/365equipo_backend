import { Controller, Post, UseGuards, Get, Query, Body } from "@nestjs/common";
import { CalculoNominasService } from "./calculo-nominas.service";
import { AuthGuard } from "../guards/auth.guard";

@Controller("calculo-nominas")
export class CalculoNominasController {
  constructor(private readonly calculoNominasService: CalculoNominasService) {}

  //   @UseGuards(AuthGuard)
  @Get("pdis")
  async getPDISDependientas() {
    return this.calculoNominasService.calcularPDIS();
  }

  //   @UseGuards(AuthGuard)
  @Get("pprod")
  async getPProdDependientas() {
    return this.calculoNominasService.calcularPPROD();
  }

  @Get("pdom")
  async calcularPDOM() {
    return this.calculoNominasService.calcularPDOM();
  }
}
