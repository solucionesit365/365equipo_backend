import { Injectable } from "@nestjs/common";
import { TiposAusencia } from "./ausencias.interface";
import { AusenciasDatabase } from "./ausencias.mongodb";
import { Cuadrantes } from "../cuadrantes/cuadrantes.class";

@Injectable()
export class Ausencias {
  constructor(
    private readonly schAusencias: AusenciasDatabase,
    private readonly cuadrantesInstance: Cuadrantes,
  ) {}

  async nuevaAusencia(
    idUsuario: number,
    tipo: TiposAusencia,
    fechaInicio: Date,
    fechaFinal: Date,
    comentario: string,
    arrayParciales: { dia: Date; horas: number }[],
  ) {
    const resInsert = await this.schAusencias.nuevaAusencia({
      idUsuario,
      tipo,
      fechaInicio,
      fechaFinal,
      comentario,
      arrayParciales: [],
    });

    if (resInsert) {
      await this.cuadrantesInstance.agregarAusencia({
        arrayParciales,
        comentario,
        fechaFinal,
        fechaInicio,
        idUsuario,
        tipo,
      });
      return resInsert;
    }
  }

  async borrarAusencia(idAusencia: string) {
    return await this.schAusencias.borrarAusencia(idAusencia);
  }
}
