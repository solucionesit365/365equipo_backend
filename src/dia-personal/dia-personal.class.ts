import { Injectable } from "@nestjs/common";
import { diaPersonalMongo } from "./dia-personal.mongodb";
import { diaPersonal } from "./dia-personal.interface";
import { ContratoService } from "../contrato/contrato.service";
import { EmailService } from "../email/email.class";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { DateTime } from "luxon";
@Injectable()
export class diaPersonalClass {
  constructor(
    private readonly schdiaPersonal: diaPersonalMongo,
    private readonly contratoService: ContratoService,
    private readonly trabajadorInstance: TrabajadorService,
    private readonly email: EmailService,
  ) {}

  //Nueva solicitud de dia personal
  async nuevaSolicitudDiaPersonal(diaPersonal: diaPersonal) {
    try {
      const horasContrato = await this.contratoService.getHorasContratoByIdNew(
        diaPersonal.idBeneficiario,
        DateTime.now(),
      );

      diaPersonal.horasContrato = horasContrato;

      const insertSolicitudDiaPersonal =
        await this.schdiaPersonal.nuevaSolicitudDiaPersonal(diaPersonal);
      if (insertSolicitudDiaPersonal) return true;

      throw Error(
        "No se ha podido insertar la nueva solicitud de dia Personal",
      );
    } catch (error) {
      console.log(error);
    }
  }

  //Mostrar todas las solicitudes de los dias personales de los trabajadores
  async getSolicitudes(year: number) {
    return await this.schdiaPersonal.getSolicitudes(year);
  }

  //Mostrar Solicitudes de los dias personales de el trabajador por idSql
  async getSolicitudesTrabajadorSqlId(idBeneficiario: number, year: number) {
    return await this.schdiaPersonal.getSolicitudesTrabajadorSqlId(
      idBeneficiario,
      year,
    );
  }

  //Mostrar Solicitudes de dia personal por _id
  async getSolicitudesById(_id: string) {
    return await this.schdiaPersonal.getSolicitudesById(_id);
  }

  async solicitudesSubordinadosDiaPersonal(
    idAppResponsable: string,
    year: number,
  ) {
    return await this.schdiaPersonal.solicitudesSubordinadosDiaPersonal(
      idAppResponsable,
      year,
    );
  }

  //Borrar solicitud de vacaciones
  async borrarSolicitud(_id: string) {
    const vacacionesToDelete = await this.schdiaPersonal.getSolicitudesById(
      _id,
    );
    if (!vacacionesToDelete) {
      throw new Error("Vacaciones no encontrada");
    }
    console.log(_id);
    await this.schdiaPersonal.borrarSolicitud(_id);
    return true;
  }

  //Actualizar estado de el dia Personal
  async updateSolicitudDiaPersonalEstado(diaPersonal: diaPersonal) {
    return await this.schdiaPersonal.updateSolicitudDiaPersonalEstado(
      diaPersonal,
    );
  }

  async actualizarIdAppResponsable(
    idBeneficiario: number,
    idAppResponsable: string,
  ) {
    return await this.schdiaPersonal.actualizarIdAppResponsable(
      idBeneficiario,
      idAppResponsable,
    );
  }

  async haySolicitudesParaBeneficiario(idBeneficiario: number) {
    return await this.schdiaPersonal.haySolicitudesParaBeneficiario(
      idBeneficiario,
    );
  }

  async enviarAlEmail(vacaciones) {
    const solicitudTrabajador =
      await this.trabajadorInstance.getTrabajadorBySqlId(
        Number(vacaciones.idBeneficiario),
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
                      <span class="value">${vacaciones.fechaInicio}</span>
                  </div>
                  <div class="item">
                      <span class="label">Fecha Final:</span>
                      <span class="value">${vacaciones.fechaFinal}</span>
                  </div>
                  <div class="item">
                      <span class="label">Fecha de Incorporación:</span>
                      <span class="value">${vacaciones.fechaIncorporacion}</span>
                  </div>
                  <div class="item">
                      <span class="label">Total de Días:</span>
                      <span class="value">${vacaciones.totalDias}</span>
                  </div>
              </div>
              <div class="section highlight">
                  <div class="item">
                      <span class="label">Observaciones:</span>
                      <span class="value">${vacaciones.observaciones}</span>
                  </div>
              </div>
          </div>
      </body>
      </html>
      
      
      `,
      "Confirmación de Solicitud de Dia Personal",
    );

    return { ok: true };
  }
}
