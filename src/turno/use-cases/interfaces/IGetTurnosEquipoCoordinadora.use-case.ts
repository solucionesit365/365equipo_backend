import { Turno } from "@prisma/client";
import { DateTime } from "luxon";

export abstract class IGetTurnosEquipoCoordinadoraUseCase {
  abstract execute(idTienda: number, fecha: DateTime): Promise<Turno[]>;
}
