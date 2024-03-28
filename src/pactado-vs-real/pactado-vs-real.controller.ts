import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from "@nestjs/common";
import { DateTime } from "luxon";
import { PactadoVsRealService } from "./pactado-vs-real.service";
import { AuthGuard } from "../guards/auth.guard";
import { User } from "../decorators/get-user.decorator";
import { UserRecord } from "firebase-admin/auth";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { GetPactadoVsRealRequestDto } from "./pactado-vs-real.dto";

@Controller("pactado-vs-real")
export class PactadoVsRealController {
  constructor(
    private readonly trabajadorService: TrabajadorService,
    private readonly pactadoRealService: PactadoVsRealService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async pactadoVsReal(
    @Query() req: GetPactadoVsRealRequestDto,
    @User() user: UserRecord,
  ) {
    if (!req.fechaInicio)
      return new BadRequestException("fechaInicio es requerida");

    const inicio = DateTime.fromJSDate(req.fechaInicio);
    const usuarioCompleto = await this.trabajadorService.getTrabajadorByAppId(
      user.uid,
    );

    const data = await this.pactadoRealService.pactadoVsReal(
      user,
      inicio.startOf("week"),
      usuarioCompleto.idTienda,
    );

    return {
      ok: true,
      data,
    };
  }

  @UseGuards(AuthGuard)
  @Get("informePactadoVsReal")
  async informePactadoVsReal(@Query() req: GetPactadoVsRealRequestDto) {
    if (!req.fechaInicio)
      return new BadRequestException("fechaInicio es requerida");

    const inicio = DateTime.fromJSDate(req.fechaInicio);

    const data = await this.pactadoRealService.informePactadoVsReal(
      inicio.startOf("week"),
    );

    return {
      ok: true,
      data,
    };
  }
}
