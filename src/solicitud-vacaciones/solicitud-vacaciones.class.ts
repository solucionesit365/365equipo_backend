import { Injectable } from "@nestjs/common";
import { SolicitudVacacionesBdd } from "./solicitud-vacaciones.mongodb";
import { SolicitudVacaciones } from "./solicitud-vacaciones.interface";

@Injectable()
export class solicitudesVacacionesClass {
  constructor(
    private readonly schSolicitudVacaciones: SolicitudVacacionesBdd,
  ) {}

  async nuevaSolicitudVacaciones(solicitudVacaciones: SolicitudVacaciones) {
    const insertSolicitudVacaciones =
      await this.schSolicitudVacaciones.nuevaSolicitudVacaciones(
        solicitudVacaciones,
      );
    if (insertSolicitudVacaciones) return true;

    throw Error("No se ha podido insertar la nueva solicitud de vacaciones");
  }
}
