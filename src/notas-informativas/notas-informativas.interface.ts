import { ObjectId } from "mongodb";

export interface NotasInformativas {
  _id: ObjectId;
  titulo: string;
  pdfNotainformativaile: string;
  caducidad: Date;
  tiendas: number;
  fechaCreacion: Date;
  creador: string;
}
