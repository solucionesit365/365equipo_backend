import { Module } from "@nestjs/common";
import { CoordinadoraRepository } from "./repository/coordinadora.repository";
import { ICoordinadoraRepository } from "./repository/interfaces/ICoordinadora.repository";
import { GetEquipoCoordinadoraPorTiendaUseCase } from "./use-cases/GetEquipoCoordinadoraPorTienda.use-case";
import { IGetEquipoCoordinadoraPorTienda } from "./use-cases/interfaces/IGetEquipoCoordinadoraPorTienda.use-case";
import { GetEquipoCoordinadoraController } from "./controllers/GetEquipoCoordinadoraPorTienda.controller";
import { CheckPINCoordinadoraUseCase } from "./use-cases/CheckPINCoordinadora.use-case";
import { ICheckPINCoordinadoraUseCase } from "./use-cases/interfaces/ICheckPINCoordinadora.use.case";
import { CheckPINCoordinadoraController } from "./controllers/CheckPINCoordinadora.controller";

@Module({
  controllers: [
    GetEquipoCoordinadoraController,
    CheckPINCoordinadoraController,
  ],
  providers: [
    { useClass: CoordinadoraRepository, provide: ICoordinadoraRepository },
    {
      useClass: GetEquipoCoordinadoraPorTiendaUseCase,
      provide: IGetEquipoCoordinadoraPorTienda,
    },
    {
      useClass: CheckPINCoordinadoraUseCase,
      provide: ICheckPINCoordinadoraUseCase,
    },
  ],
  exports: [ICoordinadoraRepository, IGetEquipoCoordinadoraPorTienda],
})
export class CoordinadoraModule {}
