import { DateTime } from "luxon";
import { ObjectId } from "mongodb";

const lol = {
  _id: "642d960573c624531e925b80",
  idTienda: 93,
  totalHoras: 18,
  idTrabajador: 5187,
  nombre: "Ruth Pierina Maldonado Garcia",
  enviado: true,
  historialPlanes: [],
  fechaEntrada: new Date(),
  fechaSalida: new Date(),
  idPlan: "642d95695841e18919cc1d58",
  ausencia: {},
};

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
}

export type TiposAusencia =
  | "BAJA"
  | "DIA_PERSONAL"
  | "VACACIONES"
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
