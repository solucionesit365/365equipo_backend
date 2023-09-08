import { Injectable } from "@nestjs/common";
import { SolicitudVacacionesBdd } from "./solicitud-vacaciones.mongodb";
import { SolicitudVacaciones } from "./solicitud-vacaciones.interface";
import { EmailClass } from "../email/email.class";
import { Trabajador } from "../trabajadores/trabajadores.class";
import { Cuadrantes } from "../cuadrantes/cuadrantes.class";
import * as moment from "moment";

@Injectable()
export class solicitudesVacacionesClass {
  constructor(
    private readonly schSolicitudVacaciones: SolicitudVacacionesBdd,
    private readonly email: EmailClass,
    private readonly trabajadorInstance: Trabajador,
    private readonly cuadrantesInstance: Cuadrantes,
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

  async getSolicitudesById(_id: string) {
    return await this.schSolicitudVacaciones.getSolicitudesById(_id);
  }

  //Borrar solicitud de vacaciones
  async borrarSolicitud(_id: string) {
    return await this.schSolicitudVacaciones.borrarSolicitud(_id);
  }

  //Enviar email
  async enviarAlEmail(vacaciones) {
    const solicitudTrabajador =
      await this.trabajadorInstance.getTrabajadorBySqlId(
        Number(vacaciones.idBeneficiario),
      );
    this.email.enviarEmail(
      solicitudTrabajador.emails,
      `Tu solicitud ha sido enviada con estos datos: <br/> 
    <table>
    <tr style="background-color:#0000ff ">
      <th>Fecha Inicio</th>
      <th>Fecha Final</th>
      <th>Fecha Incorporación</th>
      <th>Creadas el:</th>
      <th>Observación</th>
      <th>Total de días</th>
      <th>Estado</th>
    </tr>
    <tr>
      
      <td>${vacaciones.fechaInicio}</td>
      <td>${vacaciones.fechaFinal}</td>
      <td>${vacaciones.fechaIncorporacion}</td>
      <td>${vacaciones.fechaCreacion}</td>
      <td>${vacaciones.observaciones}</td>
      <td>${vacaciones.dias}</td>
      <td>${vacaciones.estado}</td>
    </tr>
  </table>
   `,
      "Solicitud de Vacaciones",
    );
    return { ok: true };
  }

  //Actualizar estado de la solicitud de Vacaciones
  async updateSolicitudVacacionesEstado(
    solicitudesVacaciones: SolicitudVacaciones,
  ) {
    const resSeter =
      await this.schSolicitudVacaciones.updateSolicitudVacacionesEstado(
        solicitudesVacaciones,
      );

    if (resSeter) {
      if (solicitudesVacaciones.estado === "APROBADA") {
        const vacaciones = await this.schSolicitudVacaciones.getSolicitudesById(
          solicitudesVacaciones._id.toString(),
        );
        await this.cuadrantesInstance.agregarAusencia({
          arrayParciales: [],
          comentario: "Vacaciones",
          fechaInicio: moment(vacaciones.fechaInicio, "DD/MM/YYYY").toDate(),
          fechaFinal: moment(vacaciones.fechaFinal, "DD/MM/YYYY").toDate(),
          idUsuario: vacaciones.idBeneficiario,
          nombre: vacaciones.idBeneficiario.toString(),
          tipo: "VACACIONES",
        });
      }
      return true;
    } else
      throw Error("No ha sido posible modificar el estado de la solicitud");
  }
}
