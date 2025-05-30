import { ObjectId, WithId } from "mongodb";
export interface SolicitudVacaciones {
  _id?: ObjectId;
  idBeneficiario: number;
  nombreApellidos: string;
  fechaInicio: string;
  fechaFinal: string;
  fechaIncorporacion: string;
  fechaCreacion: string;
  totalDias: number;
  tienda: string;
  respuestaSolicitud: string;
  observaciones: string;
  estado: string;
  creador: number;
  creadasPor?: string;
  creadorReal?: string;
  idSolicitud: number;
  enviado: boolean;
  year?: number;
  idAppResponsable: string;
  horasContrato?: number;
}

export abstract class TSolicitudVacacionesDatabaseService {
  abstract nuevaSolicitudVacaciones(
    solicitudVacaciones: SolicitudVacaciones,
  ): Promise<ObjectId>;

  abstract getSolicitudes(year: number): Promise<WithId<SolicitudVacaciones>[]>;
  abstract getSolicitudesTrabajadorSqlId(
    idBeneficiario: number,
    year: number,
  ): Promise<WithId<SolicitudVacaciones>[]>;
  abstract getVacacionesByTiendas(
    tienda: string,
  ): Promise<WithId<SolicitudVacaciones>[]>;

  abstract getsolicitudesSubordinados(
    idAppResponsable: string,
    year: number,
  ): Promise<WithId<SolicitudVacaciones>[]>;
  abstract getVacacionesByEstado(
    estado: string,
  ): Promise<WithId<SolicitudVacaciones>[]>;
  abstract getSolicitudesById(
    _id: string,
  ): Promise<WithId<SolicitudVacaciones>>;
  abstract borrarSolicitud(_id: string): Promise<boolean>;
  abstract updateSolicitudVacacionesEstado(
    solicitudesVacaciones: SolicitudVacaciones,
  ): Promise<boolean>;
  abstract haySolicitudesParaBeneficiario(
    idBeneficiario: number,
  ): Promise<boolean>;
  abstract actualizarIdAppResponsable(
    idBeneficiario: number,
    idAppResponsable: string,
  ): Promise<boolean>;
  abstract setEnviado(vacaciones: SolicitudVacaciones): Promise<boolean>;
  abstract getSolicitudesParaEnviar(): Promise<WithId<SolicitudVacaciones>[]>;
  abstract getSolicitudesMultiplesTrabajadores(
    idsTrabajadores: number[],
    year: number,
  ): Promise<WithId<SolicitudVacaciones>[]>;
}

export abstract class TSolicitudVacacionesService {
  abstract nuevaSolicitudVacaciones(
    solicitudVacaciones: SolicitudVacaciones,
  ): Promise<boolean>;

  abstract getSolicitudes(year: number): Promise<WithId<SolicitudVacaciones>[]>;
  abstract getSolicitudesTrabajadorSqlId(
    idBeneficiario: number,
    year: number,
  ): Promise<WithId<SolicitudVacaciones>[]>;
  abstract getsolicitudesSubordinados(
    idAppResponsable: string,
    year: number,
  ): Promise<WithId<SolicitudVacaciones>[]>;
  abstract getSolicitudesById(
    _id: string,
  ): Promise<WithId<SolicitudVacaciones>>;
  abstract getVacacionesByTiendas(
    nombreTienda: string,
  ): Promise<WithId<SolicitudVacaciones>[]>;
  abstract getVacacionesByEstado(
    estado: string,
  ): Promise<WithId<SolicitudVacaciones>[]>;
  abstract borrarSolicitud(_id: string): Promise<boolean>;
  abstract enviarAlEmail(vacaciones: {
    idBeneficiario: number;
    fechaInicio: string;
    fechaFinal: string;
    fechaIncorporacion: string;
    fechaCreacion: string;
    observaciones: string;
    totalDias: number;
    estado: string;
    nombreApellidos: string;
  }): Promise<{ ok: boolean }>;
  abstract ponerEnCuadrante(vacaciones: {
    fechaInicio: Date;
    fechaFinal: Date;
    idBeneficiario: number;
    nombreApellidos: string;
  }): Promise<{
    ok: boolean;
  }>;
  abstract updateSolicitudVacacionesEstado(
    solicitudesVacaciones: SolicitudVacaciones,
  ): Promise<boolean>;
  abstract actualizarIdAppResponsable(
    idBeneficiario: number,
    idAppResponsable: string,
  ): Promise<boolean>;
  abstract haySolicitudesParaBeneficiario(
    idBeneficiario: number,
  ): Promise<boolean>;
  abstract getSolicitudesMultiplesTrabajadores(
    idsBeneficiarios: number[],
    year: number,
  ): Promise<WithId<SolicitudVacaciones>[]>;
}
