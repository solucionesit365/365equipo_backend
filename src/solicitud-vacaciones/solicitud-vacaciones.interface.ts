import { ObjectId } from "mongodb";
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
}
