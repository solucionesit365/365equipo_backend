import { Injectable } from "@nestjs/common";
import { NotasInformativasDatabaseService } from "./notas-informativas.mongodb";
import { NotasInformativas } from "./notas-informativas.interface";

@Injectable()
export class NotasInformativasService {
  constructor(
    private readonly schNotasInformativas: NotasInformativasDatabaseService,
  ) {}

  async nuevaNotaInformativa(nota: NotasInformativas) {
    const insertNotaInformativa =
      await this.schNotasInformativas.nuevaNotaInformativa(nota);
    if (insertNotaInformativa) return true;

    throw Error("No se ha podido insertar la nota informativa");
  }

  async getNotasInformativas(idTienda?: number) {
    const arrayNotasInformativas =
      await this.schNotasInformativas.getNotasInformativas(idTienda);
    if (arrayNotasInformativas.length > 0) return arrayNotasInformativas;
    return null;
  }

  async getAllNotasInformativas() {
    return this.schNotasInformativas.getAllNotasInformativas();
  }

  async getNotasInformativasById(_id: string) {
    return await this.schNotasInformativas.getNotasInformativasById(_id);
  }

  async borrarNotasInformativas(notas: NotasInformativas) {
    return this.schNotasInformativas.borrarNotasInformativas(notas);
  }
}
