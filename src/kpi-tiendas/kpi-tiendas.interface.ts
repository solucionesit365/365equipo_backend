import { ObjectId } from "mongodb";

export interface KpiTiendasInterface {
  _id: ObjectId;
  semana: number;
  año: number;
  tienda: number;
  comentario?: string;
  ref: string;
}
