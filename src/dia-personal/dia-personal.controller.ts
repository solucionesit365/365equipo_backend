import {
  Controller,
  Post,
  UseGuards,
  Headers,
  Body,
  Get,
  Query,
} from "@nestjs/common";
import { AuthGuard } from "../guards/auth.guard";
import { diaPersonalClass } from "./dia-personal.class";
import { diaPersonal } from "./dia-personal.interface";
import { EmailService } from "src/email/email.class";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { DateTime } from "luxon";

@Controller("dia-personal")
export class DiaPersonalController {
  constructor(
    private readonly diaPersonalInstance: diaPersonalClass,
    private readonly trabajadorInstance: TrabajadorService,
    private readonly email: EmailService,
  ) {}

  //Nueva solicitud de vacaciones
  @UseGuards(AuthGuard)
  @Post("nuevaSolicitudDiaPersonal")
  async nuevaSolicitudDiaPersonal(@Body() diaPersonal: diaPersonal) {
    try {
      diaPersonal.fechaInicio = new Date(diaPersonal.fechaInicio);
      diaPersonal.fechaFinal = new Date(diaPersonal.fechaFinal);
      diaPersonal.fechaIncorporacion = new Date(diaPersonal.fechaIncorporacion);
      diaPersonal.fechaCreacion = new Date(diaPersonal.fechaCreacion);

      // formatear fechas con Luxon
      let fechaInicio = DateTime.fromJSDate(diaPersonal.fechaInicio).toFormat(
        "dd/MM/yyyy",
      );
      let fechaFinal = DateTime.fromJSDate(diaPersonal.fechaFinal).toFormat(
        "dd/MM/yyyy",
      );
      let fechaIncorporacion = DateTime.fromJSDate(
        diaPersonal.fechaIncorporacion,
      ).toFormat("dd/MM/yyyy");

      const solicitudTrabajador =
        await this.trabajadorInstance.getTrabajadorBySqlId(
          Number(diaPersonal.idBeneficiario),
        );
      this.email.enviarEmail(
        solicitudTrabajador.emails,
        `<!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Solicitud de Día Personal</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #eef1f4;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    background: #ffffff;
                    padding: 20px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
                }
                h1 {
                    color: #0056b3;
                    text-align: center;
                    font-size: 20px;
                    margin-bottom: 10px;
                }
                .section {
                    background-color: #f8f9fa;
                    padding: 10px;
                    margin-top: 10px;
                    border-radius: 5px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                }
                .item {
                    margin: 5px 0;
                    color: #333;
                }
                .label {
                    font-weight: bold;
                }
                .value {
                    float: right;
                }
                .highlight {
                    background-color: #d1ecf1;
                    border-color: #bee5eb;
                    color: #0c5460;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Solicitud de Día Personal</h1>
                <div class="section">
                    <div class="item">
                        <span class="label">Fecha de Inicio:</span>
                        <span class="value">${fechaInicio}</span>
                    </div>
                    <div class="item">
                        <span class="label">Fecha Final:</span>
                        <span class="value">${fechaFinal}</span>
                    </div>
                    <div class="item">
                        <span class="label">Fecha de Incorporación:</span>
                        <span class="value">${fechaIncorporacion}</span>
                    </div>
                    <div class="item">
                        <span class="label">Total de Días:</span>
                        <span class="value">${diaPersonal.totalDias}</span>
                    </div>
                </div>
                <div class="section highlight">
                    <div class="item">
                        <span class="label">Observaciones:</span>
                        <span class="value">${diaPersonal.observaciones}</span>
                    </div>
                </div>
            </div>
        </body>
        </html>
        
        
        `,
        "Confirmación de Solicitud de Dia Personal",
      );

      return {
        ok: true,
        data: await this.diaPersonalInstance.nuevaSolicitudDiaPersonal(
          diaPersonal,
        ),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  //Mostrar todas las solicitudes de los dias personales de los trabajadores
  @UseGuards(AuthGuard)
  @Get("getSolicitudes")
  async getSolicitudes(@Query() { year }) {
    try {
      return {
        ok: true,
        data: await this.diaPersonalInstance.getSolicitudes(Number(year)),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  //Mostrar Solicitudes de los dias personales de el trabajador por idSql
  @UseGuards(AuthGuard)
  @Get("solicitudesTrabajador")
  async getSolicitudesTrabajadorSqlId(@Query() { idBeneficiario, year }) {
    try {
      if (idBeneficiario) {
        return {
          ok: true,
          data: await this.diaPersonalInstance.getSolicitudesTrabajadorSqlId(
            Number(idBeneficiario),
            Number(year),
          ),
        };
      } else throw Error("Faltan datos. id");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  //Borrar solicitud de vacaciones
  @UseGuards(AuthGuard)
  @Post("borrarSolicitud")
  async borrarSolicitud(@Body() { _id }: { _id: string }) {
    try {
      await this.diaPersonalInstance.borrarSolicitud(_id);

      return {
        ok: true,
        data: "Solicitud borrada con exito",
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("setEstadoSolicitud")
  async updateSolicitudDiaPersonalEstado(@Body() diaPersonal: diaPersonal) {
    try {
      if (!diaPersonal.estado || !diaPersonal._id) throw Error("Faltan datos");

      if (
        !(
          diaPersonal.estado === "APROBADA" ||
          diaPersonal.estado === "RECHAZADA"
        )
      )
        throw Error("Estado de solicitud incorrecto");
      const resEstado =
        await this.diaPersonalInstance.updateSolicitudDiaPersonalEstado(
          diaPersonal,
        );
      if (resEstado) {
        const solicitud = await this.diaPersonalInstance.getSolicitudesById(
          diaPersonal._id.toString(),
        );

        const solicitudTrabajador =
          await this.trabajadorInstance.getTrabajadorBySqlId(
            Number(solicitud.idBeneficiario),
          );

        this.email.enviarEmail(
          solicitudTrabajador.emails,
          `
              <div style="font-family: 'Arial', sans-serif; color: #333;">
                <p>Tu Dia Personal ha sido: <strong>${
                  solicitud.estado
                }</strong></p>
                ${
                  solicitud.respuestaSolicitud
                    ? `<p><strong>Motivo:</strong> ${solicitud.respuestaSolicitud}</p>`
                    : "Controlate no gastes mucho"
                }
                <p>Esperamos que disfrutes de tu tiempo libre.</p>
                <p>Saludos cordiales,<br/>El equipo de 365</p>
              </div>
            `,
          "Estado de Dia Personal",
        );
        return {
          ok: true,
        };
      }
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
