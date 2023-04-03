import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Headers,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { getUserWithToken } from "../firebase/auth";
import { TokenService } from "../get-token/get-token.service";
import { Cuadrantes } from "./cuadrantes.class";

@Controller("cuadrantes")
export class CuadrantesController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly cuadrantesInstance: Cuadrantes,
  ) {}
  @Get()
  async getCuadrantes() {
    return false;
  }

  @Post("addCuadrante")
  @UseGuards(AuthGuard)
  async addCuadrante(
    @Body() cuadrante: ObjCuadrante,
    @Headers("authorization") authHeader: string,
  ) {
    try {
      if (!cuadrante) throw Error("Faltan datos");
      const token = this.tokenService.extract(authHeader);
      const usuario = await getUserWithToken(token);
      this.cuadrantesInstance.addCuadrante(cuadrante, usuario);
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
