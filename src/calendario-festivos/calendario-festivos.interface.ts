import { ObjectId } from "mongodb";

export interface CalendarioFestivosInterface {
  _id?: ObjectId;
  titulo: string;
  descripcion: string;
  fechaInicio: Date;
  fechaFinal: Date;
  color: string;
  tienda: number[];
  categoria: string;
}

export interface eventoNavideño {
  _id?: ObjectId;
  idUsuario: number;
  asistira: boolean;
  nombreApellidos: string;
  fechaRespuesta: Date;
  year: number;
}
