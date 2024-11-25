import { ObjectId } from "mongodb";
import { TiposAusencia } from "src/cuadrantes/cuadrantes.interface";

export interface AusenciaInterface {
  _id?: ObjectId;
  idUsuario: number;
  nombre: string;
  dni?: string;
  tipo: TiposAusencia;
  fechaInicio: Date;
  fechaFinal: Date;
  fechaRevision?: Date;
  comentario: string;
  enviado?: boolean;
  completa: boolean;
  horas?: number;
  tienda?: string;
  horasContrato?: number;
}
