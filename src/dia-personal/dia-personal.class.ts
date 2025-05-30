import { Injectable } from "@nestjs/common";
import {
  DiaPersonal,
  TDiaPersonalDatabaseService,
  TDiaPersonalService,
} from "./dia-personal.interface";
import { EmailService } from "../email/email.class";
import { TrabajadorService } from "../trabajador/trabajador.service";
import { constructEmailContent } from "./emailDiaPersonal";
import { DateTime } from "luxon";
import { IContratoService } from "../contrato/contrato.interface";

@Injectable()
export class DiaPersonalService implements TDiaPersonalService {
  constructor(
    private readonly schDiaPersonal: TDiaPersonalDatabaseService,
    private readonly contratoService: IContratoService,
    private readonly trabajadorInstance: TrabajadorService,
    private readonly email: EmailService,
  ) {}

  async nuevaSolicitudDiaPersonal(diaPersonal: DiaPersonal) {
    const horasContrato = await this.contratoService.getHorasContrato(
      diaPersonal.idBeneficiario,
      DateTime.now(),
    );

    diaPersonal.horasContrato = horasContrato;

    const insertSolicitudDiaPersonal =
      await this.schDiaPersonal.nuevaSolicitudDiaPersonal(diaPersonal);
    if (insertSolicitudDiaPersonal) return true;

    throw Error("No se ha podido insertar la nueva solicitud de dia Personal");
  }

  //Mostrar todas las solicitudes de los dias personales de los trabajadores
  async getSolicitudes(year: number) {
    return await this.schDiaPersonal.getSolicitudes(year);
  }

  //Mostrar Solicitudes de los dias personales de el trabajador por idSql
  async getSolicitudesTrabajadorSqlId(idBeneficiario: number, year: number) {
    return await this.schDiaPersonal.getSolicitudesTrabajadorSqlId(
      idBeneficiario,
      year,
    );
  }

  //Mostrar Solicitudes de dia personal por _id
  async getSolicitudesById(_id: string) {
    return await this.schDiaPersonal.getSolicitudesById(_id);
  }

  async solicitudesSubordinadosDiaPersonal(
    idAppResponsable: string,
    year: number,
  ) {
    return await this.schDiaPersonal.solicitudesSubordinadosDiaPersonal(
      idAppResponsable,
      year,
    );
  }

  //Borrar solicitud de vacaciones
  async borrarSolicitud(_id: string) {
    const vacacionesToDelete = await this.schDiaPersonal.getSolicitudesById(
      _id,
    );
    if (!vacacionesToDelete) {
      throw new Error("Vacaciones no encontrada");
    }

    await this.schDiaPersonal.borrarSolicitud(_id);
    return true;
  }

  //Actualizar estado de el dia Personal
  async updateSolicitudDiaPersonalEstado(diaPersonal: DiaPersonal) {
    return await this.schDiaPersonal.updateSolicitudDiaPersonalEstado(
      diaPersonal,
    );
  }

  async actualizarIdAppResponsableDiaPersonal(
    idBeneficiario: number,
    idAppResponsable: string,
  ) {
    return await this.schDiaPersonal.actualizarIdAppResponsableDiaPersonal(
      idBeneficiario,
      idAppResponsable,
    );
  }

  async haySolicitudesParaBeneficiarioDiaPersonal(idBeneficiario: number) {
    return await this.schDiaPersonal.haySolicitudesParaBeneficiarioDiaPersonal(
      idBeneficiario,
    );
  }

  async enviarAlEmail(diaPersonal: DiaPersonal) {
    const trabajador = await this.trabajadorInstance.getTrabajadorBySqlId(
      Number(diaPersonal.idBeneficiario),
    );
    try {
      const emailContent = constructEmailContent(diaPersonal);

      this.email.enviarEmail(
        trabajador.emails,
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
