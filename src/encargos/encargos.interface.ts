import { ObjectId } from "mongodb";

export interface EncargosInterface {
  _id: ObjectId;
  idTienda: number;
  nombre: string;
  fechaEntrega: string | Date;
  telefono: string;
  dejaCuenta?: number;
  recogido: boolean;
  rangoRecogida: string;
  horaEntrega: string | Date;
  productos: [];
}
