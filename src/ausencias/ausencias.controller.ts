import {
  Body,
  Controller,
  Post,
  UseGuards,
  Headers,
  Get,
} from "@nestjs/common";
import { Ausencias } from "./ausencias.class";
import { AuthGuard } from "../auth/auth.guard";
import { TokenService } from "../get-token/get-token.service";
import { AuthService } from "../firebase/auth";

@Controller("ausencias")
export class AusenciasController {
  constructor(
    private readonly ausenciasInstance: Ausencias,
    private readonly authInstance: AuthService,
    private readonly tokenService: TokenService,) { }

  @Post("nueva")
  // @UseGuards(AuthGuard)
  async addAusencia(
    @Body()
    {
      idUsuario,
      fechaInicio,
      fechaFinal,
      tipo,
      comentario,
      arrayParciales,
      nombre,
    },
  ) {
    try {
      if (
        tipo === "HORAS_JUSTIFICADAS" ||
        tipo === "BAJA" ||
        (tipo === "DIA_PERSONAL" &&
          typeof idUsuario === "number" &&
          typeof fechaInicio === "string" &&
          typeof fechaFinal === "string" &&
          typeof comentario === "string")
      ) {
        const inicio = new Date(fechaInicio);
        const final = new Date(fechaFinal);

        arrayParciales.map((fechaIso: string) => new Date(fechaIso));

        return {
          ok: true,
          data: await this.ausenciasInstance.nuevaAusencia(
            idUsuario,
            nombre,
            tipo,
            inicio,
            final,
            comentario,
            arrayParciales,
          ),
        };
      } else throw Error("Parámetros incorrectos");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Post("deleteAusencia")
  async deleteAusencia(
    @Headers("authorization") authHeader: string,
    @Body() { idAusencia }) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);
      const respAusencias = await this.ausenciasInstance.deleteAusencia(idAusencia);
      if (respAusencias)
        return {
          ok: true,
          data: respAusencias
        };

      throw Error("No se ha podido borrar la ausencia");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("getAusencias")
  @UseGuards(AuthGuard)
  async getAusencias(@Headers("authorization") authHeader: string) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      const respAusencias = await this.ausenciasInstance.getAusencias();
      if (respAusencias) return { ok: true, data: respAusencias };
      else throw Error("No se ha encontrado ninguna ausencia");
    } catch (error) {
      console.log(error);
    }
  }

  @Post("sincroAusenciasHit")
  // @UseGuards()
  async sincroAusenciasHit() {
    await this.ausenciasInstance.sincroAusenciasHit();
    return {
      ok: true,
    };
  }
}
