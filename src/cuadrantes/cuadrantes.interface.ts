import { ObjectId } from "mongodb";

export interface TCuadrante {
  idTrabajador: number;
  nombre: string;
  idTienda: number;
  semana: number;
  arraySemanalHoras: {
    horaEntrada: string;
    horaSalida: string;
    idPlan: ObjectId;
  }[];
  totalHoras: number;
  enviado: boolean;
}
