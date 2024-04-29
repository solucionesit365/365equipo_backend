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

      const solicitudTrabajador =
        await this.trabajadorInstance.getTrabajadorBySqlId(
          Number(diaPersonal.idBeneficiario),
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
        <h2>Solicitud de Dia Personal</h2>
        <p>Tu solicitud ha sido enviada con estos datos:</p>
        <table>
          <thead>
            <tr>
              <th>Fecha Inicio</th>
              <th>Fecha Final</th>
              <th>Fecha Incorporación</th>
              <th>Observación</th>
              <th>Total de días</th>
            </tr>
          </thead>
          <tbody>
            <tr class="highlight">
              <td>${diaPersonal.fechaInicio}</td>
              <td>${diaPersonal.fechaFinal}</td>
              <td>${diaPersonal.fechaIncorporacion}</td>
              <td>${diaPersonal.observaciones}</td>
              <td>${diaPersonal.totalDias}</td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>`,
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
      if (
        await this.diaPersonalInstance.updateSolicitudDiaPersonalEstado(
          diaPersonal,
        )
      )
        return {
          ok: true,
        };
      throw Error("No se ha podido modificar el dia personal");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
