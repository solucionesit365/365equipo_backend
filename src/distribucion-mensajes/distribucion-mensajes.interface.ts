import { ObjectId } from "mongodb";
import { DateTime } from "luxon";
export interface DistribucionMensajes {
  _id: ObjectId;
  creador: string;
  mensaje: string;
  fechaInicio: string | DateTime;
  fechaFin: string | DateTime;
  enviarEmail: boolean;
  activo: boolean;
}
