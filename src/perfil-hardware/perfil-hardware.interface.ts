import { ObjectId } from "mongodb";

export interface PerfilHardware {
  _id?: ObjectId;
  perfilHardware: string;
  tipoOrdenador: string;
  procesador: string;
  memoria: string;
  HHD: string;
  pantalla: string;
  teclado: string;
  pantallaTactil: string;
  SO: string;
  mouse: string;
  mail: string;
  monitorOficina: string;
  huellaTactil: string;
  auricular: string;
  funda: string;
  modeloPropuesto: string;
  detallesExtras: string;
}
