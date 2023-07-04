import { ObjectId } from "mongodb";

export interface VerificacionMFA {
  _id?: ObjectId;
  accion: string,
  codigo: string,
  uid: string,
  utilizado: boolean
}

