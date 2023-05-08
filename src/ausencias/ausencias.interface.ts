import { ObjectId } from "mongodb";

export interface AusenciaInterface {
  _id?: ObjectId;
  idUsuario: number;
  tipo: TiposAusencia;
  fechaInicio: Date;
  fechaFinal: Date;
  comentario: string;
  arrayParciales: {
    dia: Date;
    horas: number;
  }[];
}

export type TiposAusencia = "BAJA" | "DIA_PERSONAL" | "VACACIONES";
