import { ObjectId, WithId } from "mongodb";

export interface DiaPersonal {
  _id?: ObjectId;
  idBeneficiario: number;
  dni?: string;
  nombreApellidos: string;
  horasContrato?: number;
  fechaInicio: Date;
  fechaFinal: Date;
  fechaIncorporacion: Date;
  fechaCreacion: Date;
  totalDias: number;
  tienda: string;
  respuestaSolicitud: string;
  observaciones: string;
  estado: string;
  creador: number;
  creadasPor?: string;
  creadorReal?: string;
  year?: number;
  idAppResponsable: string;
}

export abstract class TDiaPersonalDatabaseService {
  abstract nuevaSolicitudDiaPersonal(
    diaPersonal: DiaPersonal,
  ): Promise<ObjectId>;
  abstract getSolicitudes(year: number): Promise<WithId<DiaPersonal>[]>;
  abstract getSolicitudesTrabajadorSqlId(
    idBeneficiario: number,
    year: number,
  ): Promise<WithId<DiaPersonal>[]>;
  abstract getSolicitudesById(_id: string): Promise<WithId<DiaPersonal>>;
  abstract solicitudesSubordinadosDiaPersonal(
    idAppResponsable: string,
    year: number,
  ): Promise<WithId<DiaPersonal>[]>;
  abstract borrarSolicitud(_id: string): Promise<boolean>;
  abstract updateSolicitudDiaPersonalEstado(
    diaPersonal: DiaPersonal,
  ): Promise<boolean>;
  abstract haySolicitudesParaBeneficiarioDiaPersonal(
    idBeneficiario: number,
  ): Promise<boolean>;
  abstract actualizarIdAppResponsableDiaPersonal(
    idBeneficiario: number,
    idAppResponsable: string,
  ): Promise<boolean>;
}

export abstract class TDiaPersonalService {
  abstract nuevaSolicitudDiaPersonal(
    diaPersonal: DiaPersonal,
  ): Promise<boolean>;

  abstract getSolicitudes(year: number): Promise<WithId<DiaPersonal>[]>;
  abstract getSolicitudesTrabajadorSqlId(
    idBeneficiario: number,
    year: number,
  ): Promise<WithId<DiaPersonal>[]>;
  abstract getSolicitudesById(_id: string): Promise<WithId<DiaPersonal>>;
  abstract solicitudesSubordinadosDiaPersonal(
    idAppResponsable: string,
    year: number,
  ): Promise<WithId<DiaPersonal>[]>;
  abstract borrarSolicitud(_id: string): Promise<boolean>;
  abstract updateSolicitudDiaPersonalEstado(
    diaPersonal: DiaPersonal,
  ): Promise<boolean>;
  abstract actualizarIdAppResponsableDiaPersonal(
    idBeneficiario: number,
    idAppResponsable: string,
  ): Promise<boolean>;

  abstract haySolicitudesParaBeneficiarioDiaPersonal(
    idBeneficiario: number,
  ): Promise<boolean>;

  abstract haySolicitudesParaBeneficiarioDiaPersonal(
    idBeneficiario: number,
  ): Promise<boolean>;

  abstract enviarAlEmail(diaPersonal: DiaPersonal): Promise<
    | {
        ok: boolean;
        message?: undefined;
      }
    | {
        ok: boolean;
        message: any;
      }
  >;
}
