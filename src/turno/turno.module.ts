import { Module } from "@nestjs/common";
import { TurnoRepository } from "./turno.repository";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";
import { CoordinadoraModule } from "../coordinadora/coordinadora.module";
import { ITurnoRepository } from "./turno.repository.interface";
import { DeleteTurnoController } from "./controllers/DeleteTurno.controller";
import { GetTurnosEquipoCoordinadoraController } from "./controllers/GetTurnosEquipoCoordinadora.controller";
import { GetTurnosSemanalesTrabajadorController } from "./controllers/GetTurnosSemanalesTrabajador.controller";
import { GetTurnosEquipoCoordinadoraUseCase } from "./use-cases/GetTurnosEquipoCoordinadora.use-case";
import { SaveTurnosTrabajadorSemanalController } from "./controllers/SaveTurnosTrabajadorSemanal.controller";
import { ISaveTurnosTrabajadorSemanalUseCase } from "./interface/ISaveTurnosTrabajadorSemanalUseCase";
import { SaveTurnosTrabajadorSemanalUseCase } from "./use-cases/SaveTurnosTrabajadorSemanal.use-case";

@Module({
  imports: [TrabajadoresModule, CoordinadoraModule],
  providers: [
    { provide: ITurnoRepository, useClass: TurnoRepository },
    {
      provide: ISaveTurnosTrabajadorSemanalUseCase,
      useClass: SaveTurnosTrabajadorSemanalUseCase,
    },
    GetTurnosEquipoCoordinadoraUseCase,
  ],
  controllers: [
    DeleteTurnoController,
    GetTurnosEquipoCoordinadoraController,
    GetTurnosSemanalesTrabajadorController,
    SaveTurnosTrabajadorSemanalController,
  ],
  exports: [],
})
export class TurnoModule {}
