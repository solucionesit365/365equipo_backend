import { Controller, Get, Headers } from "@nestjs/common";
import { verifyToken } from "../firebase/auth";
import { TokenService } from "../get-token/get-token.service";
import { tiendaInstance } from "./tiendas.class";

@Controller("tiendas")
export class TiendasController {
  constructor(private readonly tokenService: TokenService) {}

  @Get()
  async getTiendas(@Headers("authorization") authHeader: string) {
    try {
      const token = this.tokenService.extract(authHeader);
      await verifyToken(token);

      return {
        ok: true,
        data: await tiendaInstance.getTiendas(),
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
        data: await tiendaInstance.actualizarTiendas(),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
