import { ObjectId } from "mongodb";

export interface FichajeDto {
  _id?: ObjectId;
  hora: Date;
  uid: string;
  tipo: "ENTRADA" | "SALIDA";
  enviado: boolean;
  idExterno: number;
  comentario?: string;
}
