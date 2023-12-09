import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Headers,
} from "@nestjs/common";
import { DateTime } from "luxon";
import { TokenService } from "../get-token/get-token.service";
import { AuthService } from "../firebase/auth";
import { PactadoVsRealService } from "./pactado-vs-real.service";
import { ParseDatePipe } from "../parse-date/parse-date.pipe";

@Controller("pactado-vs-real")
export class PactadoVsRealController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly authInstance: AuthService,
    private readonly pactadoRealService: PactadoVsRealService,
  ) {}

  @Get()
  async pactadoVsReal(
    @Query("fechaInicio", ParseDatePipe) fechaInicio: Date,
    @Headers("authorization") authHeader: string,
  ) {
    if (!fechaInicio)
      return new BadRequestException("fechaInicio es requerida");

    console.log("la fecha inicio: ", fechaInicio, typeof fechaInicio);
    // const token = this.tokenService.extract(authHeader);
    // const usuarioRequest = await this.authInstance.getUserWithToken(token);

    const inicio = DateTime.fromJSDate(fechaInicio);
    // const idTiendaNumber = Number(usuarioRequest.idTienda);

    return this.pactadoRealService.pactadoVsReal(
      null, //usuarioRequest,
      inicio.startOf("week"),
      null, //idTiendaNumber,
    );
  }
}
