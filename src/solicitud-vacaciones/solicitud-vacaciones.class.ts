import { Injectable } from "@nestjs/common";
import { SolicitudVacacionesBdd } from "./solicitud-vacaciones.mongodb";
import { SolicitudVacaciones } from "./solicitud-vacaciones.interface";
import { EmailClass } from "../email/email.class";
import { Trabajador } from "../trabajadores/trabajadores.class";
import { Cuadrantes } from "../cuadrantes/cuadrantes.class";
import { recHit } from "../bbdd/mssql";
import * as moment from "moment";
import { DateTime } from "luxon";
import { ObjectId } from "mongodb";

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

  //Mostrar Solicitudes de las vacaciones de los trabajadores a cargo
  async getsolicitudesSubordinados(idAppResponsable: string) {
    return await this.schSolicitudVacaciones.getsolicitudesSubordinados(
      idAppResponsable,
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
    console.log(_id);

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

      // 3.Eliminar las vacaciones de cuadrantesInstance.
      await this.cuadrantesInstance.removeVacacionesFromCuadrantes(
        vacacionesToDelete.idBeneficiario,
        fechaInicioISO,
        fechaFinalISO,
      );
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

  async ponerEnCuadrante(vacaciones) {
    if (vacaciones) {
      await this.cuadrantesInstance.addAusenciaToCuadrantes({
        completa: true,
        enviado: false,
        comentario: "Vacaciones",
        fechaInicio: DateTime.fromJSDate(vacaciones.fechaInicio).toJSDate(),
        fechaFinal: DateTime.fromJSDate(vacaciones.fechaFinal).toJSDate(),
        idUsuario: vacaciones.idBeneficiario,
        nombre: vacaciones.nombreApellidos,
        tipo: "VACACIONES",
      });
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
        await this.cuadrantesInstance.addAusenciaToCuadrantes({
          completa: true,
          enviado: false,
          comentario: "Vacaciones",
          fechaInicio: DateTime.fromFormat(
            vacaciones.fechaInicio,
            "d/M/yyyy",
          ).toJSDate(),
          fechaFinal: DateTime.fromFormat(
            vacaciones.fechaFinal,
            "d/M/yyyy",
          ).toJSDate(),
          idUsuario: vacaciones.idBeneficiario,
          nombre: vacaciones.nombreApellidos,
          tipo: "VACACIONES",
        });
      }
      return true;
    } else
      throw Error("No ha sido posible modificar el estado de la solicitud");
  }

  async guardarEnHit(vacaciones: SolicitudVacaciones) {
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
      await this.schSolicitudVacaciones.setEnviado(vacaciones);
    }
  }

  async sendToHit() {
    const solicitudes =
      await this.schSolicitudVacaciones.getSolicitudesParaEnviar();

    for (let i = 0; i < solicitudes.length; i += 1) {
      await this.guardarEnHit(solicitudes[i]);
    }

    return true;
  }
}
