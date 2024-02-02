import { Controller, Get, Post, UseGuards, Body, Query } from "@nestjs/common";
import { AuthGuard } from "../guards/auth.guard";
import { PermisosClass } from "./permisos.class";
import { User } from "../decorators/get-user.decorator";
import { DecodedIdToken } from "firebase-admin/auth";

@Controller("permisos")
export class PermisosController {
  constructor(private readonly permisosInstance: PermisosClass) {}

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
    @User() user: DecodedIdToken,
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
    @Query() { idApp }: { idApp: string },
    @User() user: DecodedIdToken,
  ) {
    try {
      return {
        ok: true,
        data: await this.permisosInstance.getCustomClaims(
          user.customClaims,
          idApp,
        ),
      };
    } catch (err) {
      console.log(err);
      return { ok: true, data: [] };
    }
  }
}
