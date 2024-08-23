import { ObjectId } from "mongodb";

export interface NotasInformativas {
  _id: ObjectId;
  titulo: string;
  pdfNotainformativa: string;
  categoria: string; //pdf or video
  caducidad: Date;
  tiendas: number;
  fechaCreacion: Date;
  creador: string;
}
