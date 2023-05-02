import { Controller, Get, Headers, Query } from "@nestjs/common";
import { TokenService } from "../get-token/get-token.service";
import { getUserWithToken, verifyToken } from "../firebase/auth";
import { Nominas } from "./nominas.class";

@Controller("nominas")
export class NominasController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly nominaInstance: Nominas,
  ) {}
  @Get("nomina")
  async getNominas(
    @Headers("authorization") authHeader: string,
    @Query() { idArchivo }: { idArchivo: string },
  ) {
    try {
      if (typeof idArchivo !== "string") throw Error("Parámetros incorrectos");

      const token = this.tokenService.extract(authHeader);
      await verifyToken(token);
      const usuario = await getUserWithToken(token);

      return {
        ok: true,
        data: await this.nominaInstance.getNomina(usuario.dni, idArchivo),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("getListadoNominas")
  async getListadoNominas(@Headers("authorization") authHeader: string) {
    try {
      const token = this.tokenService.extract(authHeader);
      await verifyToken(token);
      const usuario = await getUserWithToken(token);

      return {
        ok: true,
        data: await this.nominaInstance.getListadoNominas(usuario.dni),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
