import { Injectable } from "@nestjs/common";
import { diaPersonalMongo } from "./dia-personal.mongodb";
import { diaPersonal } from "./dia-personal.interface";
import { ContratoService } from "../contrato/contrato.service";
import { DateTime } from "luxon";
@Injectable()
export class diaPersonalClass {
  constructor(
    private readonly schdiaPersonal: diaPersonalMongo,
    private readonly contratoService: ContratoService,
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
}
