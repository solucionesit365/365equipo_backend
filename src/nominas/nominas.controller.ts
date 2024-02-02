import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { Nominas } from "./nominas.class";
import { AuthGuard } from "../guards/auth.guard";
import { User } from "../decorators/get-user.decorator";
import { DecodedIdToken } from "firebase-admin/auth";
import { TrabajadorService } from "../trabajadores/trabajadores.class";

@Controller("nominas")
export class NominasController {
  constructor(
    private readonly trabajadorService: TrabajadorService,
    private readonly nominaInstance: Nominas,
  ) {}

  @UseGuards(AuthGuard)
  @Get("nomina")
  async getNominas(
    @User() user: DecodedIdToken,
    @Query() { idArchivo }: { idArchivo: string },
  ) {
    try {
      if (typeof idArchivo !== "string") throw Error("Parámetros incorrectos");

      const usuarioCompleto = await this.trabajadorService.getTrabajadorByAppId(
        user.uid,
      );

      return {
        ok: true,
        data: await this.nominaInstance.getNomina(
          usuarioCompleto.dni,
          idArchivo,
        ),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getListadoNominas")
  async getListadoNominas(@User() user: DecodedIdToken) {
    try {
      const usuarioCompleto = await this.trabajadorService.getTrabajadorByAppId(
        user.uid,
      );

      return {
        ok: true,
        data: await this.nominaInstance.getListadoNominas(usuarioCompleto.dni),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
