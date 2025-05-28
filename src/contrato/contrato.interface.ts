import { Contrato2 } from "@prisma/client";
import { DateTime } from "luxon";

export abstract class IContratoDatabaseService {
  abstract getHorasContrato(idSql: number, fecha: DateTime): Promise<Contrato2>;
  abstract getHistoricoContratos(dni: string): Promise<Contrato2[] | null>;
}

export abstract class IContratoService {
  abstract getHorasContrato(
    idSql: number,
    conFecha: DateTime,
  ): Promise<number | null>;
  abstract getHistoricoContratos(dni: string): Promise<Contrato2[] | null>;
}
