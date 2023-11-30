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

@Controller("pactado-vs-real")
export class PactadoVsRealController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly authInstance: AuthService,
    private readonly pactadoRealService: PactadoVsRealService,
  ) {}

  @Get()
  async pactadoVsReal(
    @Query("fechaInicio") fechaInicio: string,
    @Headers("authorization") authHeader: string,
  ) {
    if (!fechaInicio)
      return new BadRequestException("fechaInicio es requerida");

    const token = this.tokenService.extract(authHeader);
    const usuarioRequest = await this.authInstance.getUserWithToken(token);

    const inicio = DateTime.fromJSDate(new Date(fechaInicio));
    const idTiendaNumber = Number(usuarioRequest.idTienda);

    return this.pactadoRealService.pactadoVsReal(
      usuarioRequest,
      inicio.startOf("week"),
      idTiendaNumber,
    );
  }
}
