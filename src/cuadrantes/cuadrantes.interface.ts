import { ObjectId } from "mongodb";

export interface TCuadrante {
  _id: ObjectId;
  idTrabajador: number;
  nombre: string;
  idTienda: number;
  semana: number;
  arraySemanalHoras: {
    horaEntrada: string;
    horaSalida: string;
    idPlan: string;
  }[];
  totalHoras: number;
  enviado: boolean;
  historialPlanes: string[];
}
