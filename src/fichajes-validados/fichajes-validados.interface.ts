import { ObjectId } from "mongodb";

export interface FichajeValidadoDto {
  _id: ObjectId;
  idTrabajador: number;
  idResponsable: number;
  nombre: string;
  fechaEntrada: Date;
  fechaSalida: Date;
  idPlan: string;
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
}
