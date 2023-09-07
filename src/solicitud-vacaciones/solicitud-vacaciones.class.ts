import { Injectable } from "@nestjs/common";
import { SolicitudVacacionesBdd } from "./solicitud-vacaciones.mongodb";
import { SolicitudVacaciones } from "./solicitud-vacaciones.interface";

@Injectable()
export class solicitudesVacacionesClass {
  constructor(
    private readonly schSolicitudVacaciones: SolicitudVacacionesBdd,
  ) {}

  //Nueva solicitud de vacaciones
  async nuevaSolicitudVacaciones(solicitudVacaciones: SolicitudVacaciones) {
    const insertSolicitudVacaciones =
      await this.schSolicitudVacaciones.nuevaSolicitudVacaciones(
        solicitudVacaciones,
      );
    if (insertSolicitudVacaciones) return true;

    throw Error("No se ha podido insertar la nueva solicitud de vacaciones");
  }

  //Mostrar todas las solicitudes de las vacaciones de los trabajadores
  async getSolicitudes() {
    return await this.schSolicitudVacaciones.getSolicitudes();
  }

  //Mostrar Solicitudes de las vacaciones de el trabajador por idSql
  async getSolicitudesTrabajadorSqlId(idBeneficiario: number) {
    return await this.schSolicitudVacaciones.getSolicitudesTrabajadorSqlId(
      idBeneficiario,
    );
  }

  //Borrar solicitud
  async borrarSolicitud(_id: string) {
    return await this.schSolicitudVacaciones.borrarSolicitud(_id);
  }
}
