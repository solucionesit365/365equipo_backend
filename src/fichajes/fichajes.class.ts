import { Injectable } from "@nestjs/common";
import { FichajesDatabase } from "./fichajes.mongodb";
import { Trabajador } from "../trabajadores/trabajadores.class";
import { TrabajadorSql } from "../trabajadores/trabajadores.interface";
import * as moment from "moment";
import { ObjectId } from "mongodb";

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

  filtrarUidFichajeTrabajador(fichajeHit: any, trabajadores: TrabajadorSql[]) {
    for (let i = 0; i < trabajadores.length; i += 1) {
      if (trabajadores[i].id === Number(fichajeHit.usuari))
        return trabajadores[i].idApp ? trabajadores[i].idApp : "NO_TIENE_APP";
    }

    return "NO_TIENE_APP";
  }

  async fusionarFichajesHit() {
    const fichajesHit = await this.schFichajes.getFichajesHit();
    const trabajadores = await this.trabajadoresInstance.getTrabajadores();
    const fichajesPretty = [];

    for (let i = 0; i < fichajesHit.length; i += 1) {
      const idApp = this.filtrarUidFichajeTrabajador(
        fichajesHit[i],
        trabajadores,
      );
      if (idApp === "NO_TIENE_APP") continue;

      if (fichajesHit[i].accio === 1) {
        fichajesPretty.push({
          _id: fichajesHit[i].idr,
          hora: moment(fichajesHit[i].tmst).toDate(),
          uid: idApp,
          tipo: "ENTRADA",
          enviado: true,
          idExterno: Number(fichajesHit[i].usuari),
          comentario: fichajesHit[i].comentario,
          validado: false,
        });
      } else if (fichajesHit[i].accio === 2) {
        fichajesPretty.push({
          _id: fichajesHit[i].idr,
          hora: moment(fichajesHit[i].tmst).toDate(),
          uid: idApp,
          tipo: "SALIDA",
          enviado: true,
          idExterno: Number(fichajesHit[i].usuari),
          comentario: fichajesHit[i].comentario,
          validado: false,
        });
      }
    }

    await this.schFichajes.insertarFichajesHit(fichajesPretty);

    return true;
  }

  async getFichajesByIdSql(idSql: number, validado: boolean) {
    return this.schFichajes.getFichajesByIdSql(idSql, validado);
  }

  async getFichajesByUid(uid: string, fechaInicio: Date, fechaFinal: Date) {
    return await this.schFichajes.getFichajesByUid(
      uid,
      fechaInicio,
      fechaFinal,
    );
  }

  async updateFichaje(id: string, validado: boolean) {
    if (typeof id === "string") console.log(id + " - " + validado);

    return await this.schFichajes.updateFichaje(id, validado);
  }
}
