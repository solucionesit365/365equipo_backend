import { Module } from "@nestjs/common";
import { GetVentasUnaTiendaController } from "./GetVentasUnaTienda/GetVentasUnaTienda.controller";
import { GetVentasUnaTiendaUseCase } from "./GetVentasUnaTienda/GetVentasUnaTienda.use-case";
import { IGetVentasUnaTiendaUseCase } from "./GetVentasUnaTienda/IGetVentasUnaTienda.use-case";

@Module({
  providers: [
    {
      provide: IGetVentasUnaTiendaUseCase,
      useClass: GetVentasUnaTiendaUseCase,
    },
  ],
  controllers: [GetVentasUnaTiendaController],
})
export class ApiVentaModule {}
