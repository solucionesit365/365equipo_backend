import { ObjectId } from "mongodb";

export interface FichajeValidadoDto {
  _id?: string;
  idTrabajador: number,
  nombre: string,
  semana: number,
  fecha:Date,
  cuadrante:{
    entrada: string,
    salida:string
  },
  fichajes:{
    entrada: string,
    salida: string
  },
  idFichajes:{
    entrada: string,
    salida:string
  }
  comentario?: string;
}