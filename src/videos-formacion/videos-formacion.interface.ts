import { ObjectId } from "mongodb";

//Guardar el video
export interface videosFormacion365Interface {
  _id: ObjectId;
  titulo: string;
  descripcion: string;
  categoria: string;
  creacion: Date;
  views: number;
  urlVideo: string;
  tiendas: number[];
}
//Ver quien ha visto el video
export interface videosVistosFormacion365Interface {
  _id: ObjectId;
  idVideo: string;
  titulo: string;
  categoria: string;
  urlVideo: string;
  visto: Date;
  tienda: string;
  nombre: string;
}
