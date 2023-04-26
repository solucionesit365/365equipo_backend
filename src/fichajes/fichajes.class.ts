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

  async getEstado(uid: string, dia: Date) {
    const fichajes = await this.schFichajes.getFichajesDia(uid, dia);

    let entrada = false;
    
    for (let i = 0; i < fichajes.length; i += 1) {
        if ()
    }
    // buscar en mongodb los del usuario en este día
    // pensar si no ha fichado, fichado, fichado y desfichado.
  }
}
