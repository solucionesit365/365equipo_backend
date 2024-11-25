import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { diaPersonalMongo } from "./dia-personal.mongodb";
import { DiaPersonal } from "./dia-personal.interface";
import { ContratoService } from "../contrato/contrato.service";
import { EmailService } from "../email/email.class";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { constructEmailContent } from "./emailDiaPersonal";
import { DateTime } from "luxon";
@Injectable()
export class DiaPersonalClass {
  constructor(
    private readonly schdiaPersonal: diaPersonalMongo,
    private readonly contratoService: ContratoService,
    @Inject(forwardRef(() => TrabajadorService))
    private readonly trabajadorInstance: TrabajadorService,
    private readonly email: EmailService,
  ) {}

  //Nueva solicitud de dia personal
  async nuevaSolicitudDiaPersonal(diaPersonal: DiaPersonal) {
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
  async updateSolicitudDiaPersonalEstado(diaPersonal: DiaPersonal) {
    return await this.schdiaPersonal.updateSolicitudDiaPersonalEstado(
      diaPersonal,
    );
  }

  async actualizarIdAppResponsableDiaPersonal(
    idBeneficiario: number,
    idAppResponsable: string,
  ) {
    return await this.schdiaPersonal.actualizarIdAppResponsableDiaPersonal(
      idBeneficiario,
      idAppResponsable,
    );
  }

  async haySolicitudesParaBeneficiarioDiaPersonal(idBeneficiario: number) {
    return await this.schdiaPersonal.haySolicitudesParaBeneficiarioDiaPersonal(
      idBeneficiario,
    );
  }

  async enviarAlEmail(diaPersonal) {
    try {
      const solicitudTrabajador =
        await this.trabajadorInstance.getTrabajadorBySqlId(
          Number(diaPersonal.idBeneficiario),
        );

      const emailContent = constructEmailContent(diaPersonal);

      this.email.enviarEmail(
        solicitudTrabajador.emails,
        emailContent,
        "Confirmación de Solicitud de Dia Personal",
      );

      return { ok: true };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
