import { Controller, Get, Post, UseGuards, Body, Query } from "@nestjs/common";
import { AuthGuard } from "../guards/auth.guard";
import { PermisosService } from "./permisos.class";
import { User } from "../decorators/get-user.decorator";
import { UserRecord } from "firebase-admin/auth";
import { GetCustomClaimsRequestDto } from "./permisos.dto";

@Controller("permisos")
export class PermisosController {
  constructor(private readonly permisosInstance: PermisosService) {}

  @UseGuards(AuthGuard)
  @Get("listaCompleta")
  async listaCompleta() {
    try {
      return { ok: true, data: ["RRHH_ADMIN", "SUPER_ADMIN"] };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("setCustomClaims")
  async setCustomsClaims(
    @Body() { uidUsuarioDestino, arrayPermisos },
    @User() user: UserRecord,
  ) {
    try {
      if (
        uidUsuarioDestino &&
        typeof uidUsuarioDestino === "string" &&
        arrayPermisos
      ) {
        return {
          ok: true,
          data: await this.permisosInstance.setCustomClaims(
            user.customClaims,
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

  @UseGuards(AuthGuard)
  @Get("customClaims")
  async getCustomClaims(
    @Query() req: GetCustomClaimsRequestDto,
    @User() usuarioGestor: UserRecord,
  ) {
    try {
      return {
        ok: true,
        data: await this.permisosInstance.getCustomClaims(
          usuarioGestor.customClaims,
          req.idApp,
        ),
      };
    } catch (err) {
      console.log(err);
      return { ok: true, data: [] };
    }
  }
}
