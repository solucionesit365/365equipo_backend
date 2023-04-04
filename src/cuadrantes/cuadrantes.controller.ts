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
import { TCuadrante } from "./cuadrantes.interface";

@Controller("cuadrantes")
export class CuadrantesController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly cuadrantesInstance: Cuadrantes,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async getCuadrantes(
    @Body() { semana, idTrabajador }: { semana: number; idTrabajador: number },
    @Headers("authorization") authHeader: string,
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      const usuario = await getUserWithToken(token);

      if (!semana || !idTrabajador) throw Error("Faltan datos");

      if (usuario.coordinadora && usuario.idTienda) {
        return {
          ok: true,
          data: await this.cuadrantesInstance.getCuadrantes(
            usuario.idTienda,
            idTrabajador,
            semana,
          ),
        };
      }
      throw Error("Opción no disponible para este tipo de empled@");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Post("addCuadrante")
  @UseGuards(AuthGuard)
  async addCuadrante(
    @Body() cuadrante: TCuadrante,
    @Headers("authorization") authHeader: string,
  ) {
    try {
      if (!cuadrante) throw Error("Faltan datos");
      const token = this.tokenService.extract(authHeader);
      const usuario = await getUserWithToken(token);

      if (usuario.coordinadora && usuario.idTienda) {
        cuadrante.idTienda = usuario.idTienda;
        cuadrante.enviado = false;
        await this.cuadrantesInstance.addCuadrante(cuadrante);
        return { ok: true };
      }
      throw Error("No llevas equipo o tienda para realizar esta acción");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
