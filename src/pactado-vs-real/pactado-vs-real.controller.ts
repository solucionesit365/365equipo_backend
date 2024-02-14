import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from "@nestjs/common";
import { DateTime } from "luxon";
import { PactadoVsRealService } from "./pactado-vs-real.service";
import { ParseDatePipe } from "../parse-date/parse-date.pipe";
import { AuthGuard } from "../guards/auth.guard";
import { User } from "../decorators/get-user.decorator";
import { UserRecord } from "firebase-admin/auth";
import { TrabajadorService } from "../trabajadores/trabajadores.class";

@Controller("pactado-vs-real")
export class PactadoVsRealController {
  constructor(
    private readonly trabajadorService: TrabajadorService,
    private readonly pactadoRealService: PactadoVsRealService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async pactadoVsReal(
    @Query("fechaInicio", ParseDatePipe) fechaInicio: Date,
    @User() user: UserRecord,
  ) {
    if (!fechaInicio)
      return new BadRequestException("fechaInicio es requerida");

    const inicio = DateTime.fromJSDate(fechaInicio);
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
}
