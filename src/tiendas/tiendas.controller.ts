import { Controller, Get, Headers, Query, UseGuards } from "@nestjs/common";
import { getUserWithToken, verifyToken } from "../firebase/auth";
import { TokenService } from "../get-token/get-token.service";
import { Tienda } from "./tiendas.class";
import { AuthGuard } from "../auth/auth.guard";
import { Trabajador } from "../trabajadores/trabajadores.class";

@Controller("tiendas")
export class TiendasController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly tiendasInstance: Tienda,
    private readonly trabajadorInstance: Trabajador,
  ) {}

  @Get()
  async getTiendas(@Headers("authorization") authHeader: string) {
    try {
      const token = this.tokenService.extract(authHeader);
      await verifyToken(token);

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
      await verifyToken(token);

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
      await verifyToken(token);

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
