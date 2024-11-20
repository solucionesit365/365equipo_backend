import { ObjectId } from "mongodb";

export interface HardWareInterface {
  _id: ObjectId;
  trabajador: string;
  departamento: string;
  tipo: string;
  marca: string;
  modelo: string;
  SN: string;
  IMEI: string;
  IMEI2: string;
  wmicBios: string;
  SO: string;
  procesador: string;
  memoria: string;
  tipoDisk: string;
  capacidad: string;
  fechaEntrega: Date;
  licenciaOffice: string;
  estadoPrestamo: string;
  historial: [];
}
