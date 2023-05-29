import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { Ausencias } from "./ausencias.class";
import { AuthGuard } from "../auth/auth.guard";

@Controller("ausencias")
export class AusenciasController {
  constructor(private readonly ausenciasInstance: Ausencias) {}

  @Post("nueva")
  // @UseGuards(AuthGuard)
  async addAusencia(
    @Body()
    { idUsuario, fechaInicio, fechaFinal, tipo, comentario, arrayParciales },
  ) {
    try {
      if (
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

  @Post("borrar")
  async borrarAusencia(@Body() { idAusencia }) {
    try {
      if (typeof idAusencia === "string") {
        const res = await this.ausenciasInstance.borrarAusencia(idAusencia);

        if (res) return { ok: true, data: true };
        else throw Error("No se ha podido borrar esta ausencia");
      } else throw Error("Parámetros incorrectos");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
