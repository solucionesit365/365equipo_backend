import { ObjectId, WithId } from "mongodb";

export interface FichajeDto {
  _id?: ObjectId;
  hora: Date;
  uid: string;
  tipo: "ENTRADA" | "SALIDA";
  enviado: boolean;
  idExterno: number;
  comentario?: string;
  validado: boolean;
  idTrabajador?: number; //no existe, pero para poder mutar la interface
}

export interface ParFichaje {
  entrada: WithId<FichajeDto>;
  salida: WithId<FichajeDto>;
}
