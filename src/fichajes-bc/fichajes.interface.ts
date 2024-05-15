import { ObjectId, WithId } from "mongodb";
import { TCuadrante } from "../cuadrantes/cuadrantes.interface";

export interface FichajeDto {
  _id?: ObjectId;
  hora: Date;
  uid: string;
  tipo: "ENTRADA" | "SALIDA" | "INICIO_DESCANSO" | "FINAL_DESCANSO";
  enviado: boolean;
  idExterno: number;
  comentario?: string;
  validado: boolean;
  nombre: string;
  dni: string;
  idTrabajador?: number; //no existe, pero para poder mutar la interface
}

export interface ParFichaje {
  entrada: WithId<FichajeDto>;
  salida: WithId<FichajeDto>;
  cuadrante: TCuadrante;
}
