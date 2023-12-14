import { Injectable } from "@nestjs/common";
import {
  CalendarioFestivosInterface,
  eventoNavideño,
} from "./calendario-festivos.interface";
import { CalendarioFestivosDatabase } from "./calendario-festivos.mongodb";
import * as moment from "moment";

@Injectable()
export class CalendarioFestivo {
  constructor(private readonly schCalendario: CalendarioFestivosDatabase) {}

  async nuevoFestivo(festivo: CalendarioFestivosInterface) {
    const insertFestivo = await this.schCalendario.nuevoFestivo(festivo);
    if (insertFestivo) return true;

    throw Error("No se ha podido insertar la auditoria");
  }

  async getfestivos() {
    return await this.schCalendario.getFestivos();
  }

  async getfestivosByTienda(tienda: number) {
    return await this.schCalendario.getFestivosByTienda(tienda);
  }

  //Notificacion navideña

  async nuevoEvento(festivo: eventoNavideño) {
    const insertFestivo = await this.schCalendario.nuevoEvento(festivo);
    if (insertFestivo) return true;

    throw Error("No se ha podido insertar la auditoria");
  }

  async verificacionRespuesta(idUsuario: number) {
    return await this.schCalendario.verificacionRespuesta(idUsuario);
  }

  async getEventos() {
    return await this.schCalendario.getEventos();
  }

  async getEventosByAsistirOrNo(asistira: string) {
    return await this.schCalendario.getEventosByAsistirOrNo(asistira);
  }
}
