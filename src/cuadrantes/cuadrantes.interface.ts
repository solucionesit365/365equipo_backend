import { DateTime } from "luxon";
import { ObjectId } from "mongodb";

export interface TCuadrante {
  _id: ObjectId;
  idTrabajador: number;
  idPlan: string;
  idTienda: number;
  inicio: Date;
  final: Date;
  nombre: string;
  totalHoras: number;
  enviado: boolean;
  historialPlanes: string[];
  horasContrato: number;
  ausencia: TAusenciaMin;
  bolsaHorasInicial: number;
  borrable?: boolean;
  dni?: string;
}

export type TiposAusencia =
  | "BAJA"
  | "PERMISO MATERNIDAD/PATERNIDAD"
  | "DIA_PERSONAL"
  | "VACACIONES"
  | "SANCIÓN"
  | "ABSENTISMO"
  | "HORAS_JUSTIFICADAS";

export interface TRequestCuadrante {
  // nombre: string;
  idTrabajador: number;
  arraySemanalHoras: {
    bloqueado: boolean;
    horaEntrada: string | DateTime;
    horaSalida: string | DateTime;
    idPlan: string;
    idTienda: number;
    idCuadrante: string;
    ausencia: TAusenciaMin;
    borrable?: boolean;
  }[];
  totalHoras: number;
  idTiendaDefault: number;
  fecha: string;
}

type TAusenciaMin = {
  tipo: TiposAusencia;
  horas?: number;
  completa: boolean;
  idAusencia: ObjectId;
};
