import { Controller, Get, Query } from "@nestjs/common";
import { IGetVentasUnaTiendaUseCase } from "./IGetVentasUnaTienda.use-case";
import { GetVentasUnaTiendaDto } from "./GetVentasUnaTienda.dto";
import { DateTime } from "luxon";

@Controller("ventas-una-tienda")
export class GetVentasUnaTiendaController {
  constructor(private readonly getVentasUseCase: IGetVentasUnaTiendaUseCase) {}

  @Get()
  handle(@Query() queryReq: GetVentasUnaTiendaDto) {
    const { tienda, fechaInicioISO, fechaFinalISO } = queryReq;

    if (fechaInicioISO !== undefined && fechaFinalISO !== undefined) {
      return this.getVentasUseCase.execute(tienda, {
        fechaInicio: DateTime.fromISO(fechaInicioISO),
        fechaFinal: DateTime.fromISO(fechaFinalISO),
      });
    } else {
      return this.getVentasUseCase.execute(tienda);
    }
  }
}
