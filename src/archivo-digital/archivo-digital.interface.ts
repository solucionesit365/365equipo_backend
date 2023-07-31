import { ObjectId } from "mongodb";

export interface ArchivoDigitalInterface {
  _id?: ObjectId;
  nombrearchivo: string;
  ref: string;
  creador: string;
  creacion: Date;
  edit: Date;
  propietario: number;
  tipo: string;
}
