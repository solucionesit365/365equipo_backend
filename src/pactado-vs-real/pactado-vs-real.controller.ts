import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Headers,
  UseGuards,
} from "@nestjs/common";
import { DateTime } from "luxon";
import { FirebaseService } from "../firebase/firebase.service";
import { PactadoVsRealService } from "./pactado-vs-real.service";
import { ParseDatePipe } from "../parse-date/parse-date.pipe";
import { AuthGuard } from "../guards/auth.guard";
import { User } from "../decorators/get-user.decorator";
import { DecodedIdToken } from "firebase-admin/auth";
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
    @User() user: DecodedIdToken,
  ) {
    if (!fechaInicio)
      return new BadRequestException("fechaInicio es requerida");

    const inicio = DateTime.fromJSDate(fechaInicio);
    const usuarioCompleto = await this.trabajadorService.getTrabajadorByAppId(
      user.uid,
    );

    return this.pactadoRealService.pactadoVsReal(
      user,
      inicio.startOf("week"),
      usuarioCompleto.idTienda,
    );
  }
}
