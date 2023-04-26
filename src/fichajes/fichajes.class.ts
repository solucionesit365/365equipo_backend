import { Injectable } from "@nestjs/common";
import { FichajesDatabase } from "./fichajes.mongodb";

@Injectable()
export class Fichajes {
  constructor(private readonly schFichajes: FichajesDatabase) {}

  async nuevaEntrada(uid: string) {
    const hora = new Date();
    const insert = await this.schFichajes.nuevaEntrada(uid, hora);

    if (insert) return true;

    throw Error("No se ha podido registrar la entrada");
  }

  async nuevaSalida(uid: string) {
    const hora = new Date();
    const insert = await this.schFichajes.nuevaSalida(uid, hora);

    if (insert) return true;

    throw Error("No se ha podido registrar la salida");
  }
}
