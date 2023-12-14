import * as moment from "moment";
import { recHit, recSoluciones, recSolucionesNew } from "../bbdd/mssql";
import * as schVacaciones from "./vacaciones.mssql";
import { Injectable } from "@nestjs/common";
import { Cuadrantes } from "../cuadrantes/cuadrantes.class";
import { SolicitudVacaciones } from "./vacaciones.interface";
import { EmailClass } from "../email/email.class";
import { Trabajador } from "../trabajadores/trabajadores.class";
import { DateTime } from "luxon";

@Injectable()
export class Vacaciones {
  constructor(
    private readonly cuadrantesInstance: Cuadrantes,
    private readonly emailInstance: EmailClass,
    private readonly trabajadorInstance: Trabajador,
  ) {}
  async getSolicitudById(idSolicitud: number) {
    return await schVacaciones.getSolicitudById(Number(idSolicitud));
  }
  async nuevaSolicitudVacaciones(solicitud: SolicitudVacaciones) {
    if (await schVacaciones.nuevaSolicitudVacaciones(solicitud)) {
      const usuario = await this.trabajadorInstance.getTrabajadorBySqlId(
        solicitud.idBeneficiario,
      );
      const mensaje = `
        Beneficiario: ${usuario.nombreApellidos} <br>
        Fecha de inicio: ${solicitud.fechaInicial} <br>
        Fecha final: ${solicitud.fechaFinal} <br>
        Fecha incorporación: ${solicitud.fechaIncorporacion} <br>
        Total días de vacaciones: ${solicitud.totalDias} <br>
        Oberservación: ${solicitud.observaciones} <br>
        Estado: PENDIENTE DE APROBACIÓN.
    `;
      // this.emailInstance.sendMailById(
      //   solicitud.idBeneficiario,
      //   mensaje,
      //   "NUEVA SOLICITUD DE VACACIONES",
      // );
      return true;
    }
    throw Error("No se ha podido crear la solicitud de vacaciones");
  }

  async getSolicitudesTrabajadorUid(uid: string) {
    return await schVacaciones.getSolicitudesTrabajadorUid(uid);
  }

  async getSolicitudesTrabajadorSqlId(id: number) {
    return await schVacaciones.getSolicitudesTrabajadorSqlId(id);
  }

  async borrarSolicitud(idSolicitud: number) {
    return await schVacaciones.borrarSolicitud(idSolicitud);
  }

  async getSolicitudes() {
    return await schVacaciones.getSolicitudes();
  }

  async getSolicitudesSubordinados(idApp: string) {
    return await schVacaciones.getSolicitudesSubordinados(idApp);
  }

  async getSolicitudesParaEnviar() {
    return await schVacaciones.getSolicitudesParaEnviar();
  }

  // Cuadrantes 2.0
  async setEstadoSolicitud(
    estado: string,
    idSolicitud: number,
    respuesta: string,
  ) {
    const resSeter = await schVacaciones.setEstadoSolicitud(
      estado,
      idSolicitud,
      respuesta,
    );

    if (resSeter) {
      if (estado === "APROBADA") {
        const vacaciones = await schVacaciones.getSolicitudById(idSolicitud);
        await this.cuadrantesInstance.addAusenciaToCuadrantes({
          completa: true,
          enviado: false,
          comentario: "Vacaciones",
          fechaInicio: DateTime.fromFormat(
            vacaciones.fechaInicio,
            "dd/MM/yyyy",
          ).toJSDate(),
          fechaFinal: DateTime.fromFormat(
            vacaciones.fechaFinal,
            "dd/MM/yyyy",
          ).toJSDate(),
          idUsuario: vacaciones.idBeneficiario,
          nombre: vacaciones.idBeneficiario,
          tipo: "VACACIONES",
        });
      }
      return true;
    } else
      throw Error("No ha sido posible modificar el estado de la solicitud");
  }

  async getVacacionesByTiendas(idTienda: number) {
    return await schVacaciones.getVacacionesByTiendas(idTienda);
  }

  async getVacacionesByEstado(estado: string) {
    return await schVacaciones.getVacacionesByEstado(estado);
  }

  async setEnviadoApi(id: number) {
    return await schVacaciones.setEnviadoApi(id);
  }
}
