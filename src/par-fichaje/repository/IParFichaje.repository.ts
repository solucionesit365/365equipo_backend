import { DateTime } from "luxon";

export abstract class IParFichajeRepository {
  abstract getParesFichajeManyTrabajadores(
    trabajadorIds: number[],
    fechaInicio: DateTime,
    fechaFin: DateTime,
  ): Promise<any>;
}
