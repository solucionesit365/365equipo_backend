import { Injectable } from "@nestjs/common";
import { NotasInformativasDatabes } from "./notas-informativas.mongodb";
import { NotasInformativas } from "./notas-informativas.interface";

@Injectable()
export class NotasInformativasClass {
  constructor(
    private readonly schnotasInformativas: NotasInformativasDatabes,
  ) {}

  async nuevaNotaInformativa(nota: NotasInformativas) {
    const insertNotaInformativa =
      await this.schnotasInformativas.nuevaNotaInformativa(nota);
    if (insertNotaInformativa) return true;

    throw Error("No se ha podido insertar la nota informativa");
  }

  async getNotasInformativas(idTienda?: number) {
    const arrayNotasInformativas =
      await this.schnotasInformativas.getNotasInformativas(idTienda);
    if (arrayNotasInformativas.length > 0) return arrayNotasInformativas;
    return null;
  }

  async borrarNotasInformativas(notas: NotasInformativas) {
    return this.schnotasInformativas.borrarNotasInformativas(notas);
  }
}
