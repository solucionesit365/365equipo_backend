import { Controller, Post, Get, Body, Headers } from "@nestjs/common";
import { TokenService } from "../get-token/get-token.service";
import { FichajesValidados } from "./fichajes-validados.class";
import { FichajeValidadoDto } from "./fichajes-validados.interface";
import { AuthService } from "../firebase/auth";

@Controller("fichajes-validados")
export class FichajesValidadosController {
  constructor(
    private readonly authInstance: AuthService,
    private readonly tokenService: TokenService,
    private readonly fichajesValidadosInstance: FichajesValidados,
  ) {}

  @Post("addFichajeValidado")
  async addFichajeValidado(
    @Body() fichajeValidado: FichajeValidadoDto,
    @Headers("authorization") authHeader: string,
  ) {
    try {
      if (!fichajeValidado.idTrabajador) throw Error("Faltan parametros");
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      if (
        await this.fichajesValidadosInstance.addFichajesValidados(
          fichajeValidado,
        )
      )
        return {
          ok: true,
        };
      throw Error("No se ha podido insertar el anuncio");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
