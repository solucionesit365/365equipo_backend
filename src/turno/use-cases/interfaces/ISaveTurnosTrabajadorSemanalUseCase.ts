import { Turno } from "@prisma/client";
import { DateTime } from "luxon";

// Para reducir la complejidad del tipo del request
export interface IReqSaveTurnosTrabajadorSemanal {
  idTrabajador: number;
  inicioSemana: DateTime;
  arrayTurnos: {
    id: string;
    inicio: DateTime;
    final: DateTime;
    tiendaId: number;
    borrable: boolean;
  }[];
}

export abstract class ISaveTurnosTrabajadorSemanalUseCase {
  abstract execute(
    idTrabajador: IReqSaveTurnosTrabajadorSemanal["idTrabajador"],
    inicioSemana: IReqSaveTurnosTrabajadorSemanal["inicioSemana"],
    arrayTurnos: IReqSaveTurnosTrabajadorSemanal["arrayTurnos"],
  ): Promise<Turno[]>;
}
