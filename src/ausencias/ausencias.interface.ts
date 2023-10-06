import { ObjectId } from "mongodb";

export interface AusenciaInterface {
  _id?: ObjectId;
  idUsuario: number;
  nombre: string;
  tipo: TiposAusencia;
  fechaInicio: Date;
  fechaFinal: Date;
  comentario: string;
  enviado?: boolean;
  completa: boolean;
  horas?: number;
}

export type TiposAusencia =
  | "BAJA"
  | "DIA_PERSONAL"
  | "VACACIONES"
  | "HORAS_JUSTIFICADAS";
