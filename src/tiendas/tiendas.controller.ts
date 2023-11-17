import { Controller, Get, Headers, Query, UseGuards } from "@nestjs/common";
import { TokenService } from "../get-token/get-token.service";
import { Tienda } from "./tiendas.class";
import { AuthGuard } from "../auth/auth.guard";
import { Trabajador } from "../trabajadores/trabajadores.class";
import { AuthService } from "../firebase/auth";

@Controller("tiendas")
export class TiendasController {
  constructor(
    private readonly authInstance: AuthService,
    private readonly tokenService: TokenService,
    private readonly tiendasInstance: Tienda,
    private readonly trabajadorInstance: Trabajador,
  ) {}

  @Get()
  async getTiendas(@Headers("authorization") authHeader: string) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      return {
        ok: true,
        data: await this.tiendasInstance.getTiendas(),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("getTiendasApi")
  // Guard
  async getTiendasApi() {
    try {
      return {
        ok: true,
        data: await this.tiendasInstance.getTiendas(),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("actualizarTiendas")
  async actualizarTiendas(@Headers("authorization") authHeader: string) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      return {
        ok: true,
        data: await this.tiendasInstance.actualizarTiendas(),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("responsable")
  // @UseGuards(AuthGuard)
  async getTiendasResponsable(
    @Headers("authorization") authHeader: string,
    @Query() { idApp },
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      const usuario = await this.trabajadorInstance.getTrabajadorByAppId(idApp);
      // const usuario: any = { idApp: "AKjL8PGzPOPeeXmsc9EXYZKzpx12" };
      return {
        ok: true,
        data: await this.tiendasInstance.getTiendasResponsable(usuario),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
