import {
  Body,
  Controller,
  Post,
  UseGuards,
  Headers,
  Get,
} from "@nestjs/common";
import { Ausencias } from "./ausencias.class";
import { AusenciaInterface } from "./ausencias.interface";
import { AuthGuard } from "../auth/auth.guard";
import { TokenService } from "../get-token/get-token.service";
import { AuthService } from "../firebase/auth";

@Controller("ausencias")
export class AusenciasController {
  constructor(
    private readonly ausenciasInstance: Ausencias,
    private readonly authInstance: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  // Cuadrantes 2.0
  @Post("nueva")
  // @UseGuards(AuthGuard)
  async addAusencia(
    @Body()
    {
      idUsuario,
      fechaInicio,
      fechaFinal,
      fechaRevision,
      tipo,
      comentario,
      nombre,
      dni,
      completa,
      horas,
    },
  ) {
    try {
      if (
        tipo === "BAJA" ||
        tipo === "PERMISO MATERNIDAD/PATERNIDAD" ||
        tipo === "DIA_PERSONAL" ||
        tipo === "VACACIONES" ||
        tipo === "HORAS_JUSTIFICADAS" ||
        tipo === "SANCIÓN" ||
        tipo === "ABSENTISMO" ||
        (tipo === "DIA_PERSONAL" &&
          typeof idUsuario === "number" &&
          typeof fechaInicio === "string" &&
          typeof fechaFinal === "string" &&
          typeof fechaRevision === "string" &&
          typeof comentario === "string" &&
          typeof completa === "boolean" &&
          typeof horas === "number")
      ) {
        const inicio = new Date(fechaInicio);
        const final = new Date(fechaFinal);
        const revision = fechaRevision ? new Date(fechaRevision) : null;

        return {
          ok: true,
          data: await this.ausenciasInstance.nuevaAusencia(
            idUsuario,
            nombre,
            dni,
            tipo,
            inicio,
            final,
            revision,
            comentario,
            completa,
            horas,
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
    @Body() { idAusencia },
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);
      const respAusencias = await this.ausenciasInstance.deleteAusencia(
        idAusencia,
      );
      if (respAusencias)
        return {
          ok: true,
          data: respAusencias,
        };

      throw Error("No se ha podido borrar la ausencia");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Post("updateAusencia")
  async updateAusencia(
    @Body() ausencia: AusenciaInterface,
    @Headers("authorization") authHeader: string,
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);
      const respAusencia = await this.ausenciasInstance.updateAusencia(
        ausencia,
      );
      if (respAusencia)
        return {
          ok: true,
          data: respAusencia,
        };

      throw Error("No se ha podido modificar la ausencia");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Post("updateAusenciaResto")
  async updateAusenciaResto(
    @Body() ausencia: AusenciaInterface,
    @Headers("authorization") authHeader: string,
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);
      const respAusencia = await this.ausenciasInstance.updateAusenciaResto(
        ausencia,
      );
      if (respAusencia)
        return {
          ok: true,
          data: respAusencia,
        };

      throw Error("No se ha podido modificar la ausencia");
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
