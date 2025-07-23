import { Module } from "@nestjs/common";
import { CoordinadoraRepository } from "./coordinadora.repository";
import { ICoordinadoraRepository } from "./coordinadora.repository.interface";
import { GetEquipoCoordinadoraPorTiendaUseCase } from "./use-cases/GetEquipoCoordinadoraPorTienda.use-case";
import { IGetEquipoCoordinadoraPorTienda } from "./use-cases/GetEquipoCoordinadoraPorTiendaInterface";
import { GetEquipoCoordinadoraController } from "./controllers/GetEquipoCoordinadoraPorTienda.controller";

@Module({
  controllers: [GetEquipoCoordinadoraController],
  providers: [
    { useClass: CoordinadoraRepository, provide: ICoordinadoraRepository },
    {
      useClass: GetEquipoCoordinadoraPorTiendaUseCase,
      provide: IGetEquipoCoordinadoraPorTienda,
    },
  ],
  exports: [ICoordinadoraRepository, IGetEquipoCoordinadoraPorTienda],
})
export class CoordinadoraModule {}
