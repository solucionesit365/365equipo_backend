import { Injectable } from "@nestjs/common";
import { TipoAusencia } from "./ausencias.interface";
import { AusenciasDatabase } from "./ausencias.mongodb";
import { Trabajador } from "../trabajadores/trabajadores.class";

@Injectable()
export class Ausencias {
  constructor(private readonly schAusencias: AusenciasDatabase) {}

  async nuevaAusencia(
    idUsuario: number,
    tipo: TipoAusencia,
    fechaInicio: Date,
    fechaFinal: Date,
    comentario: string,
  ) {
    return await this.schAusencias.nuevaAusencia({
      idUsuario,
      tipo,
      fechaInicio,
      fechaFinal,
      comentario,
    });
  }

  async borrarAusencia(idAusencia: string) {
    return await this.schAusencias.borrarAusencia(idAusencia);
  }
}
