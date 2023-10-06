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

  async getSolicitudesParaEnviar() {
    return schVacaciones.getSolicitudesParaEnviar();
  }

  async getSolicitudesSubordinados(idApp: string) {
    return await schVacaciones.getSolicitudesSubordinados(idApp);
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

  async guardarEnHit(vacaciones: {
    idBeneficiario: number;
    dias: number;
    fechaInicio: string;
    fechaFinal: string;
    fechaIncorporacion: string;
    observaciones: string;
    respuestaSolicitud: string;
    fechaCreacion: string;
    estado: string;
    idSolicitud: number;
    enviado: boolean;
  }) {
    if (!vacaciones.idBeneficiario || vacaciones.estado != "APROBADA")
      return false;
    const fechaInicio = moment(vacaciones.fechaInicio, "DD/MM/YYYY");
    const fechaFinal = moment(vacaciones.fechaFinal, "DD/MM/YYYY");
    const nombreTabla = `cdpCalendariLaboral_${moment().format("YYYY")}`;

    if (!fechaInicio.isValid() || !fechaFinal.isValid()) return false;

    const sql = `
      DECLARE @InsertedRows INT;
      DECLARE @UpdatedRows INT;

      WITH Dates AS (
        SELECT CONVERT(datetime, '${fechaInicio.format(
          "YYYY-MM-DD",
        )}', 126) AS Date
        UNION ALL
        SELECT DATEADD(day, 1, Date)
        FROM Dates
        WHERE DATEADD(day, 1, Date) <= CONVERT(datetime, '${fechaFinal.format(
          "YYYY-MM-DD",
        )}', 126)
      )
      MERGE ${nombreTabla} AS Target
      USING (SELECT * FROM Dates) AS Source
      ON Target.idEmpleado = ${vacaciones.idBeneficiario}
        AND MONTH(Target.fecha) = MONTH(Source.Date)
        AND YEAR(Target.fecha) = YEAR(Source.Date)
        AND DAY(Target.fecha) = DAY(Source.Date)
      WHEN MATCHED THEN
        UPDATE SET
          Target.estado = 'VACANCES',
          Target.observaciones = '[Horas:24]',
          Target.TimeStamp = GETDATE(),
          Target.usuarioModif = '365Equipo'
      WHEN NOT MATCHED THEN
        INSERT (id, fecha, idEmpleado, estado, observaciones, TimeStamp, usuarioModif)
        VALUES (NEWID(), Source.Date, ${
          vacaciones.idBeneficiario
        }, 'VACANCES', '[Horas:24]', GETDATE(), '365Equipo');

      SET @InsertedRows = @@ROWCOUNT;

      -- Retorna el número de filas insertadas
      SELECT @InsertedRows AS InsertedRows;
    `;
    const resultado = await recHit("Fac_Tena", sql);

    if (
      resultado.recordset.length > 0 &&
      fechaFinal.diff(fechaInicio, "days") + 1 ===
        resultado.recordset[0].InsertedRows
    ) {
      await recSolucionesNew(
        "UPDATE solicitudVacaciones SET enviado = 1 WHERE idSolicitud = @param0",
        vacaciones.idSolicitud,
      );
    }
  }

  async sendToHit() {
    const solicitudes = await this.getSolicitudesParaEnviar();

    for (let i = 0; i < solicitudes.length; i += 1) {
      await this.guardarEnHit(solicitudes[i]);
    }

    return true;
  }

  async getVacacionesByTiendas(idTienda: number) {
    return await schVacaciones.getVacacionesByTiendas(idTienda);
  }

  async getVacacionesByEstado(estado: string) {
    return await schVacaciones.getVacacionesByEstado(estado);
  }
}
