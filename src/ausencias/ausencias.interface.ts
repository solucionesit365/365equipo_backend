import { ObjectId } from "mongodb";

export interface AusenciaInterface {
  _id?: ObjectId;
  idUsuario: number;
  tipo: TipoAusencia;
  fechaInicio: Date;
  fechaFinal: Date;
  comentario: string;
}

export type TipoAusencia = "BAJA" | "DIA_PERSONAL";
