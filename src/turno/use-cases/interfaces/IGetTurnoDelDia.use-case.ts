import { Turno } from "@prisma/client";
import { DateTime } from "luxon";

export abstract class IGetTurnoDelDiaUseCase {
  abstract execute(idTrabajador: number, fecha: DateTime): Promise<Turno>;
}
