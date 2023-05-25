import {
  Controller,
  Get,
  Post,
  UseGuards,
  Headers,
  Body,
  Query,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { TokenService } from "../get-token/get-token.service";
import { AuthService } from "../firebase/auth";
import { Trabajador } from "../trabajadores/trabajadores.class";
import { PermisosClass } from "./permisos.class";

@Controller("permisos")
export class PermisosController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly authInstance: AuthService,
    private readonly permisosInstance: PermisosClass,
  ) {}
  @Get("listaCompleta")
  async listaCompleta() {
    try {
      return { ok: true, data: ["RRHH_ADMIN", "SUPER_ADMIN"] };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Post("setCustomClaims")
  @UseGuards(AuthGuard)
  async setCustomsClaims(
    @Headers("authorization") authHeader: string,
    @Body() { uidUsuarioDestino, arrayPermisos },
  ) {
    try {
      if (
        uidUsuarioDestino &&
        typeof uidUsuarioDestino === "string" &&
        arrayPermisos
      ) {
        const token = this.tokenService.extract(authHeader);
        await this.authInstance.verifyToken(token);
        const usuarioGestor = await this.authInstance.getUserWithToken(token);

        return {
          ok: true,
          data: await this.permisosInstance.setCustomClaims(
            usuarioGestor.customClaims,
            uidUsuarioDestino,
            arrayPermisos,
          ),
        };
      } else throw Error("Faltan parámetros o no son correctos");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("customClaims")
  async getCustomClaims(
    @Headers("authorization") authHeader: string,
    @Query() { idApp }: { idApp: string },
  ) {
    try {
      // Esta función no debe fallar si no encuentra los claims
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);
      const usuarioGestor = await this.authInstance.getUserWithToken(token);

      return {
        ok: true,
        data: await this.permisosInstance.getCustomClaims(
          usuarioGestor.customClaims,
          idApp,
        ),
      };
    } catch (err) {
      console.log(err);
      return { ok: true, data: [] };
    }
  }
}
