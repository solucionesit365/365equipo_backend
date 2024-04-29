import { ObjectId } from "mongodb";

export interface diaPersonal {
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
