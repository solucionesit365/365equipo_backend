import { ObjectId } from "mongodb";

export interface cultura365Interface {
  _id: ObjectId;
  titulo: string;
  descripcion: string;
  creacion: Date;
  views: number;
  urlVideo: string;
}
