import { ObjectId } from "mongodb";

//Guardar el video
export interface videosFormacion365Interface {
  _id: ObjectId;
  titulo: string;
  descripcion: string;
  creacion: Date;
  views: number;
  urlVideo: string;
}
//Ver quien ha visto el video
export interface videosVistosFormacion365Interface {
  _id: ObjectId;
  idVideo: string;
  titulo: string;
  urlVideo: string;
  visto: Date;
  tienda: string;
  nombre: string;
}
