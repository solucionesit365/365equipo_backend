import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { SanidadService } from "./sanidad.service";
import { AuthGuard } from "../guards/auth.guard";
import { GetFormacionesTrabajadorDto, NuevaFormacionDto } from "./sanidad.dto";

@Controller("sanidad")
export class SanidadController {
  constructor(private readonly sanidadService: SanidadService) {}

  @UseGuards(AuthGuard)
  @Post("nuevaFormacion")
  async nuevaFormacion(@Body() req: NuevaFormacionDto) {
    return await this.sanidadService.nuevaFormacion(req);
  }

  @UseGuards(AuthGuard)
  @Get("getFormacionesTrabajador")
  async getFormacionesTrabajador(@Query() req: GetFormacionesTrabajadorDto) {
    return await this.sanidadService.getFormacionesTrabajador(req);
  }
}
