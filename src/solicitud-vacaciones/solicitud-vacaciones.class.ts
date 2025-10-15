import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { SolicitudVacacionesDatabase } from "./solicitud-vacaciones.mongodb";
import { SolicitudVacaciones } from "./solicitud-vacaciones.interface";
import { EmailService } from "../email/email.class";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { Cuadrantes } from "../cuadrantes/cuadrantes.class";
import { DateTime } from "luxon";
import { ContratoService } from "../contrato/contrato.service";

@Injectable()
export class SolicitudesVacacionesService {
  constructor(
    private readonly schSolicitudVacaciones: SolicitudVacacionesDatabase,
    private readonly email: EmailService,
    @Inject(forwardRef(() => TrabajadorService))
    private readonly trabajadorInstance: TrabajadorService,
    private readonly contratoService: ContratoService,
    @Inject(forwardRef(() => Cuadrantes))
    private readonly cuadrantesInstance: Cuadrantes,
  ) {}

  //Nueva solicitud de vacaciones
  async nuevaSolicitudVacaciones(solicitudVacaciones: SolicitudVacaciones) {
    try {
      const idBeneficiario =
        typeof solicitudVacaciones.idBeneficiario === "object" &&
        solicitudVacaciones.idBeneficiario !== null &&
        (solicitudVacaciones.idBeneficiario as { id?: any } | null)?.id !==
          undefined
          ? (solicitudVacaciones.idBeneficiario as { id: any }).id
          : solicitudVacaciones.idBeneficiario;

      // Asignar el idBeneficiario correctamente
      solicitudVacaciones.idBeneficiario = idBeneficiario;

      const horasContrato = await this.contratoService.getHorasContratoByIdNew(
        idBeneficiario,
        DateTime.now(),
      );

      solicitudVacaciones.horasContrato = horasContrato;

      const insertSolicitudVacaciones =
        await this.schSolicitudVacaciones.nuevaSolicitudVacaciones(
          solicitudVacaciones,
        );
      if (insertSolicitudVacaciones) return true;

      throw Error("No se ha podido insertar la nueva solicitud de vacaciones");
    } catch (error) {
      console.log(error);
    }
  }

  //Mostrar todas las solicitudes de las vacaciones de los trabajadores
  async getSolicitudes(year: number) {
    return await this.schSolicitudVacaciones.getSolicitudes(year);
  }

  //Mostrar Solicitudes de las vacaciones de el trabajador por idSql
  async getSolicitudesTrabajadorSqlId(idBeneficiario: number, year: number) {
    return await this.schSolicitudVacaciones.getSolicitudesTrabajadorSqlId(
      idBeneficiario,
      year,
    );
  }

  //Mostrar Solicitudes de las vacaciones de los trabajadores a cargo
  async getsolicitudesSubordinados(idAppResponsable: string, year: number) {
    return await this.schSolicitudVacaciones.getsolicitudesSubordinados(
      idAppResponsable,
      year,
    );
  }

  //Mostrar Solicitudes de vacaciones por _id
  async getSolicitudesById(_id: string) {
    return await this.schSolicitudVacaciones.getSolicitudesById(_id);
  }

  //Mostrar Solicitudes de las vacaciones por tienda
  async getVacacionesByTiendas(nombreTienda: string) {
    return await this.schSolicitudVacaciones.getVacacionesByTiendas(
      nombreTienda,
    );
  }
  //Mostrar Solicitudes de las vacaciones por estado
  async getVacacionesByEstado(estado: string) {
    return await this.schSolicitudVacaciones.getVacacionesByEstado(estado);
  }

  //Borrar solicitud de vacaciones
  async borrarSolicitud(_id: string) {
    // 1.obtener la vacaciones que se van a eliminar
    const vacacionesToDelete =
      await this.schSolicitudVacaciones.getSolicitudesById(_id);
    if (!vacacionesToDelete) {
      throw new Error("Vacaciones no encontrada");
    }

    // 2. Eliminar las vacaciones de schSolicitudVacaciones.
    await this.schSolicitudVacaciones.borrarSolicitud(_id);

    try {
      //Convertir las fechas a el formato string
      const fechaInicioISO = DateTime.fromFormat(
        vacacionesToDelete.fechaInicio,
        "d/M/yyyy",
      ).toJSDate();
      const fechaFinalISO = DateTime.fromFormat(
        vacacionesToDelete.fechaFinal,
        "d/M/yyyy",
      ).toJSDate();
    } catch (error) {
      throw new Error(
        `Error al procesar la eliminación de las vacaciones: ${error.message}`,
      );
    }

    return true;
  }

  //Enviar email
  async enviarAlEmail(vacaciones) {
    const solicitudTrabajador =
      await this.trabajadorInstance.getTrabajadorBySqlId(
        Number(vacaciones.idBeneficiario),
      );
    this.email.enviarEmail(
      solicitudTrabajador.emails,
      `<!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #4a4a4a;
          margin: 0;
          padding: 20px;
          background-color: #f4f4f4;
        }
        h2 {
          color: #0047ab;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin-top: 20px;
          border: 1px solid #000000;
        }
        th {
          background-color: #0047ab;
          color: #ffffff;
          padding: 10px;
          text-align: center;
        }
        td {
          background-color: #ffffff;
          color: #000000;
          padding: 10px;
          text-align: center;
          border-bottom: 1px solid #dddddd;
          
        }
        .highlight {
          background-color: #e7f4ff;
        }
        th, td {
          border: 1px solid #000000;
        }
        p{
          color: #000000;
        }
      </style>
    </head>
    <body>
      <h2>Solicitud de Vacaciones</h2>
      <p>Tu solicitud ha sido enviada con estos datos:</p>
      <table>
        <thead>
          <tr>
            <th>Fecha Inicio</th>
            <th>Fecha Final</th>
            <th>Fecha Incorporación</th>
            <th>Creadas el</th>
            <th>Observación</th>
            <th>Total de días</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr class="highlight">
            <td>${vacaciones.fechaInicio}</td>
            <td>${vacaciones.fechaFinal}</td>
            <td>${vacaciones.fechaIncorporacion}</td>
            <td>${vacaciones.fechaCreacion}</td>
            <td>${vacaciones.observaciones}</td>
            <td>${vacaciones.totalDias}</td>
            <td>${vacaciones.estado}</td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>`,
      "Confirmación de Solicitud de Vacaciones",
    );

    return { ok: true };
  }

  async ponerEnCuadrante(vacaciones) {
    if (vacaciones) {
      return { ok: true };
    }
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
      }
      return true;
    } else
      throw Error("No ha sido posible modificar el estado de la solicitud");
  }

  async actualizarIdAppResponsable(
    idBeneficiario: number,
    idAppResponsable: string,
  ) {
    return await this.schSolicitudVacaciones.actualizarIdAppResponsable(
      idBeneficiario,
      idAppResponsable,
    );
  }

  async haySolicitudesParaBeneficiario(idBeneficiario: number) {
    return await this.schSolicitudVacaciones.haySolicitudesParaBeneficiario(
      idBeneficiario,
    );
  }

  async getSolicitudesMultiplesTrabajadores(
    idsBeneficiarios: number[],
    year: number,
  ) {
    return await this.schSolicitudVacaciones.getSolicitudesMultiplesTrabajadores(
      idsBeneficiarios,
      year,
    );
  }
}
