import {
  Controller,
  Post,
  UseGuards,
  Headers,
  Body,
  Get,
  Query,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { TokenService } from "../get-token/get-token.service";
import { AuthService } from "../firebase/auth";
import { EvaluacionesClass } from "./evaluaciones.class";
import {
  evaluacionesInterface,
  TipoEvaluacion,
} from "./evaluaciones.interface";
import { database } from "firebase-admin";
@Controller("evaluaciones")
export class EvaluacionesController {
  constructor(
    private readonly authInstance: AuthService,
    private readonly tokenService: TokenService,
    private readonly evaluacionesclass: EvaluacionesClass,
  ) {}

  @Post("addPlantilla")
  @UseGuards(AuthGuard)
  async addPlantilla(
    @Headers("authorization") authHeader: string,
    @Body() evaluacion: evaluacionesInterface,
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      const response = await this.evaluacionesclass.addPlantilla(evaluacion);
      if (response) {
        return {
          ok: true,
          data: response,
        };
      } else return { ok: false };
    } catch (error) {
      console.log(error);
    }
  }

  @Get("getPlantillas")
  @UseGuards(AuthGuard)
  async getPlantillas(
    @Headers("authorization") authHeader: string,
    @Query() tipo: TipoEvaluacion,
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      const response = await this.evaluacionesclass.getPlantillas(tipo);
      if (response) {
        return {
          ok: true,
          data: response,
        };
      }
    } catch (error) {}
  }
}
