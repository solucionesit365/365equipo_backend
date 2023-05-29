import { ObjectId } from "mongodb";

export interface NotificacionDto {
  _id?: ObjectId;
  uid: string;
  token: string;
}

export interface InAppNotification {
  _id?: ObjectId;
  uid: string;
  titulo: string;
  mensaje: string;
  leido: boolean;
  creador: "SISTEMA" | "RRHH";
}
