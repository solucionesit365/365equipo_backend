import { TCuadrante } from "../cuadrantes/cuadrantes.interface";

export interface TFichajeValidado {
  _id?: string;
  idTrabajador: number;
  idResponsable: number;
  nombre: string;
  fecha: Date;
  cuadrante: TCuadrante
  fichajes: {
    entrada: Date;
    salida: Date;
  };
  idFichajes: {
    entrada: string;
    salida: string;
  };
  comentario: {
    entrada: string;
    salida: string;
  };
  horasPagar: {
    total: number;
    comentario: string;
    respSuper: string;
    estadoValidado: string;
  };
  aPagar: boolean;
  pagado: boolean;
  horasExtra: number;
  horasAprendiz: number;
  horasCoordinacion: number;
  horasCuadrante: number;
  enviado: boolean;
}
export interface FichajeValidadoDtoOld {
  _id?: string;
  idTrabajador: number;
  idResponsable: number;
  nombre: string;
  semana: number;
  fecha: string;
  cuadrante: {
    entrada: string;
    salida: string;
    idPlan: string;
  };
  fichajes: {
    entrada: string;
    salida: string;
  };
  idFichajes: {
    entrada: string;
    salida: string;
  };
  comentario: {
    entrada: string;
    salida: string;
  };
  horasPagar: {
    total: number;
    comentario: string;
    respSuper: string;
    estadoValidado: string;
  };
  aPagar: boolean;
  pagado: boolean;
  year: number;
  horasExtra: number;
  horasAprendiz: number;
  horasCoordinacion: number;
  horasCuadrante: number;
  enviado: boolean;
}
