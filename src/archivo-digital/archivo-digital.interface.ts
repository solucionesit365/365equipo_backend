import { ObjectId } from "mongodb";

export interface ArchivoDigitalInterface {
  _id?: ObjectId;
  ref: string;
  creador: string;
  creación: Date;
  edit: Date;
  propietario: number;
  tipo: string;
}
