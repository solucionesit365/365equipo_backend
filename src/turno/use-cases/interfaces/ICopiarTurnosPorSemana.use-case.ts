import { DateTime } from "luxon";

export abstract class ICopiarTurnosPorSemanaUseCase {
  abstract execute(
    tiendaID: number,
    semanaOrigen: DateTime,
    semanaDestino: DateTime,
  ): Promise<void>;
}
