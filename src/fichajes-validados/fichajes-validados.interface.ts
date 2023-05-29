import { ObjectId } from "mongodb";

export interface FichajeValidadoDto {
  _id?: string;
  idTrabajador: number,
  idResponsable: number,
  nombre: string,
  semana: number,
  fecha: Date,
  cuadrante: {
    entrada: string,
    salida: string,
    idPlan: string
  },
  fichajes: {
    entrada: string,
    salida: string
  },
  idFichajes: {
    entrada: string,
    salida: string
  },
  comentario: {
    entrada: string,
    salida: string
  },
  horasPagar: {
    total: number,
    comentario: string,
    respSuper: string,
    estadoValidado: string
  },
  aPagar: boolean
}
