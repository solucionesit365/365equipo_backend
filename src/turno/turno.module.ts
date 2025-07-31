import { Module } from "@nestjs/common";
import { TurnoRepository } from "./repository/turno.repository";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";
import { CoordinadoraModule } from "../coordinadora/coordinadora.module";
import { ITurnoRepository } from "./repository/interfaces/turno.repository.interface";
import { DeleteTurnoController } from "./controllers/DeleteTurno.controller";
import { GetTurnosEquipoCoordinadoraController } from "./controllers/GetTurnosEquipoCoordinadora.controller";
import { GetTurnosSemanalesTrabajadorController } from "./controllers/GetTurnosSemanalesTrabajador.controller";
import { GetTurnosEquipoCoordinadoraUseCase } from "./use-cases/GetTurnosEquipoCoordinadora.use-case";
import { SaveTurnosTrabajadorSemanalController } from "./controllers/SaveTurnosTrabajadorSemanal.controller";
import { ISaveTurnosTrabajadorSemanalUseCase } from "./use-cases/interfaces/ISaveTurnosTrabajadorSemanalUseCase";
import { SaveTurnosTrabajadorSemanalUseCase } from "./use-cases/SaveTurnosTrabajadorSemanal.use-case";
import { CopiarTurnoPorSemanaController } from "./controllers/CopiarTurnosPorSemana.controller";
import { ICopiarTurnosPorSemanaUseCase } from "./use-cases/interfaces/ICopiarTurnosPorSemana.use-case";
import { CopiarTurnosPorSemanaUseCase } from "./use-cases/CopiarTurnosPorSemana.use-case";
import { IGetTurnosEquipoCoordinadoraUseCase } from "./use-cases/interfaces/IGetTurnosEquipoCoordinadora.use-case";
import { IGetTurnoDelDiaUseCase } from "./use-cases/interfaces/IGetTurnoDelDia.use-case";
import { GetTurnoDelDiaUseCase } from "./use-cases/GetTurnoDelDia.use-case";
import { GetAllTurnosController } from "./controllers/GetAllTurnos.controller";
import { GetTurnosUnaSemanaController } from "./controllers/GetTurnosUnaSemana.controller";
import { GetTurnosTodasSemanasController } from "./controllers/GetTurnosTodasSemanas.controller";
import { GetTurnosSupersController } from "./controllers/GetTurnosSupers.controller";

@Module({
  imports: [TrabajadoresModule, CoordinadoraModule],
  providers: [
    { provide: ITurnoRepository, useClass: TurnoRepository },
    {
      provide: ISaveTurnosTrabajadorSemanalUseCase,
      useClass: SaveTurnosTrabajadorSemanalUseCase,
    },
    {
      provide: ICopiarTurnosPorSemanaUseCase,
      useClass: CopiarTurnosPorSemanaUseCase,
    },
    {
      provide: IGetTurnosEquipoCoordinadoraUseCase,
      useClass: GetTurnosEquipoCoordinadoraUseCase,
    },
    {
      provide: IGetTurnoDelDiaUseCase,
      useClass: GetTurnoDelDiaUseCase,
    },
  ],
  controllers: [
    DeleteTurnoController,
    GetTurnosEquipoCoordinadoraController,
    GetTurnosSemanalesTrabajadorController,
    SaveTurnosTrabajadorSemanalController,
    CopiarTurnoPorSemanaController,
    GetAllTurnosController,
    GetTurnosUnaSemanaController,
    GetTurnosTodasSemanasController,
    GetTurnosSupersController,
  ],
  exports: [IGetTurnoDelDiaUseCase, ITurnoRepository],
})
export class TurnoModule {}
