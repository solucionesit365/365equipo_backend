import { DateTime } from "luxon";
import { Turno } from "@prisma/client";

export interface IReqSaveTurnoTrabajadorIndividual {
  idTrabajador: number;
  dia: DateTime;
  turnos: Array<{
    id: string;
    inicio: DateTime;
    final: DateTime;
    tiendaId: number;
    borrable: boolean;
  }>;
}

export abstract class ISaveTurnoTrabajadorIndividualUseCase {
  abstract execute(
    idTrabajador: IReqSaveTurnoTrabajadorIndividual["idTrabajador"],
    dia: IReqSaveTurnoTrabajadorIndividual["dia"],
    turnos: IReqSaveTurnoTrabajadorIndividual["turnos"],
  ): Promise<Turno[]>;
}
