import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Headers,
  Query,
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
    @Query() { semana, idTrabajador }: { semana: string; idTrabajador: string },
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
            Number(idTrabajador),
            Number(semana),
          ),
        };
      }
      throw Error("Opción no disponible para este tipo de empled@");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Post("saveCuadrante")
  @UseGuards(AuthGuard)
  async saveCuadrante(
    @Body() cuadrante: TCuadrante,
    @Headers("authorization") authHeader: string,
  ) {
    try {
      if (!cuadrante) throw Error("Faltan datos");
      const token = this.tokenService.extract(authHeader);
      const usuario = await getUserWithToken(token);

      if (usuario.coordinadora && usuario.idTienda) {
        // cuadrante.idTienda = usuario.idTienda;
        // cuadrante.enviado = false;
        const oldCuadrante = await this.cuadrantesInstance.getCuadrantes(
          usuario.idTienda,
          cuadrante.idTrabajador,
          cuadrante.semana,
        );
        cuadrante.idTienda = usuario.idTienda;
        await this.cuadrantesInstance.saveCuadrante(cuadrante, oldCuadrante);
        return { ok: true };
      }
      throw Error("No llevas equipo o tienda para realizar esta acción");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
