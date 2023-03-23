import { MultiFactorSettings, UserRecord } from "firebase-admin/auth";

export interface TrabajadorSql {
  id: number;
  idApp: string;
  nombreApellidos: string;
  displayName?: string;
  emails: string;
  dni: string;
  direccion: string;
  ciudad: string;
  telefonos: string;
  fechaNacimiento: string;
  nacionalidad: string;
  nSeguridadSocial: string;
  codigoPostal: string;
  cuentaCorriente: string;
  tipoTrabajador: string;
  inicioContrato: string;
  finalContrato: string;
  idResponsable: number;
  idTienda: number;
  coordinadora: boolean;
  supervisora: boolean;
  antiguedad: string;
}

export interface TrabajadorCompleto extends TrabajadorSql, UserRecord {
  displayName: string;
}
