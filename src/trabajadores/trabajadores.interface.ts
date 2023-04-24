import { UserRecord } from "firebase-admin/auth";

export interface TrabajadorSql {
  id: number;
  idApp: string;
  nombreApellidos: string;
  displayName: string;
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
  coordinadora: number;
  supervisora: boolean;
  nombreResponsable: string;
  nombreTienda: string;
  antiguedad: string;
  tokenQR: string;
}

// export interface TrabajadorCompleto extends TrabajadorSql, UserRecord {
//   displayName: string;
//   toJSON: any;
// }

type UserRecordWithoutToJSON = Omit<UserRecord, "toJSON">;

export interface TrabajadorCompleto
  extends TrabajadorSql,
    UserRecordWithoutToJSON {
  displayName: string;
}
