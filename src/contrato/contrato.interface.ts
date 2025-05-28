import { Contrato2 } from "@prisma/client";
import { DateTime } from "luxon";

export abstract class IContratoDatabaseService {
  abstract getHorasContrato(idSql: number, fecha: DateTime): Promise<Contrato2>;
}
