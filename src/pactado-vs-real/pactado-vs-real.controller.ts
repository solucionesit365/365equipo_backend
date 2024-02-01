import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Headers,
  UseGuards,
} from "@nestjs/common";
import { DateTime } from "luxon";
import { TokenService } from "../get-token/get-token.service";
import { FirebaseService } from "../firebase/auth";
import { PactadoVsRealService } from "./pactado-vs-real.service";
import { ParseDatePipe } from "../parse-date/parse-date.pipe";
import { AuthGuard } from "../auth/auth.guard";

@Controller("pactado-vs-real")
export class PactadoVsRealController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly authInstance: FirebaseService,
    private readonly pactadoRealService: PactadoVsRealService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async pactadoVsReal(
    @Query("fechaInicio", ParseDatePipe) fechaInicio: Date,
    @Headers("authorization") authHeader: string,
  ) {
    if (!fechaInicio)
      return new BadRequestException("fechaInicio es requerida");

    const token = this.tokenService.extract(authHeader);
    const usuarioRequest = await this.authInstance.getUserWithToken(token);

    const inicio = DateTime.fromJSDate(fechaInicio);
    const idTiendaNumber = Number(usuarioRequest.idTienda);

    return this.pactadoRealService.pactadoVsReal(
      usuarioRequest,
      inicio.startOf("week"),
      idTiendaNumber,
    );
  }
}
