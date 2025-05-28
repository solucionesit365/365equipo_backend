import { Injectable } from "@nestjs/common";
import { DateTime } from "luxon";
import {
  IContratoDatabaseService,
  IContratoService,
} from "./contrato.interface";

@Injectable()
export class ContratoService extends IContratoService {
  constructor(private readonly schContrato: IContratoDatabaseService) {
    super();
  }

  // Recuerda: la zona horario es clave (en el servidor y el motor de MySQL).
  async getHorasContrato(idSql: number, conFecha: DateTime) {
    const fecha = conFecha.endOf("day");
    const responseHorasContrato = await this.schContrato.getHorasContrato(
      idSql,
      fecha,
    );

    if (responseHorasContrato)
      return (Number(responseHorasContrato.horasContrato) * 40) / 100;

    return null;
  }

  getHistoricoContratos(dni: string) {
    return this.schContrato.getHistoricoContratos(dni);
  }
}
