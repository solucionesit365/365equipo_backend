import { Injectable } from "@nestjs/common";
import { FichajesDatabase } from "./fichajes.mongodb";
import { Trabajador } from "../trabajadores/trabajadores.class";

@Injectable()
export class Fichajes {
  constructor(
    private readonly schFichajes: FichajesDatabase,
    private readonly trabajadoresInstance: Trabajador,
  ) {}

  async nuevaEntrada(uid: string) {
    const hora = new Date();
    const trabajadorCompleto =
      await this.trabajadoresInstance.getTrabajadorByAppId(uid);
    const insert = await this.schFichajes.nuevaEntrada(
      uid,
      hora,
      trabajadorCompleto.id,
    );

    if (insert) return true;

    throw Error("No se ha podido registrar la entrada");
  }

  async nuevaSalida(uid: string) {
    const hora = new Date();
    const trabajadorCompleto =
      await this.trabajadoresInstance.getTrabajadorByAppId(uid);
    const insert = await this.schFichajes.nuevaSalida(
      uid,
      hora,
      trabajadorCompleto.id,
    );

    if (insert) return true;

    throw Error("No se ha podido registrar la salida");
  }

  async getEstado(uid: string, fecha: Date) {
    const fichajes = await this.schFichajes.getFichajesDia(uid, fecha);
    const primerFichaje = fichajes[0];
    const ultimoFichaje = fichajes[fichajes.length - 1];

    if (!ultimoFichaje) {
      return "SIN_ENTRADA";
    } else if (primerFichaje.tipo === "SALIDA") {
      return "ERROR";
    } else if (ultimoFichaje.tipo === "ENTRADA") {
      return "TRABAJANDO";
    } else if (ultimoFichaje.tipo === "SALIDA") {
      return "HA_SALIDO";
    } else return "ERROR";
  }

  async sincroFichajes() {
    const fichajesPendientes = await this.schFichajes.getFichajesSincro();
    await this.schFichajes.enviarHit(fichajesPendientes);
  }
}
