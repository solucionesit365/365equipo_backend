import { ObjectId } from "mongodb";
export interface DistribucionMensajes {
  _id: ObjectId;
  titulo: string;
  creador: string;
  mensaje: string;
  fechaInicio: Date;
  fechaFin: Date;
  enviarEmail: boolean;
  activo: boolean;
  createdAt: Date;
  updatedAt?: Date;
}
