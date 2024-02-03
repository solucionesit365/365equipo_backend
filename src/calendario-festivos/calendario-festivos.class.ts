import { Injectable } from "@nestjs/common";
import {
  CalendarioFestivosInterface,
  eventoNavideño,
} from "./calendario-festivos.interface";
import { CalendarioFestivosDatabase } from "./calendario-festivos.mongodb";

@Injectable()
export class CalendarioFestivoService {
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

  async updateFestivo(festivo: CalendarioFestivosInterface) {
    return await this.schCalendario.updateFestivo(festivo);
  }

  async deleteFestivo(idFestivo: string) {
    return await this.schCalendario.deleteFestivo(idFestivo);
  }

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
