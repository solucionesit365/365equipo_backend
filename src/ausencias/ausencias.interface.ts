import { ObjectId } from "mongodb";
import { TiposAusencia } from "src/cuadrantes/cuadrantes.interface";

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
