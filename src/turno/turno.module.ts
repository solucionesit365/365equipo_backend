import { Module } from "@nestjs/common";
import { TurnoRepository } from "./turno.repository";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";
import { CoordinadoraModule } from "../coordinadora/coordinadora.module";
import { ITurnoRepository } from "./turno.repository.interface";
import { DeleteTurnoController } from "./controllers/DeleteTurno.controller";
import { GetTurnosEquipoCoordinadoraController } from "./controllers/GetTurnosEquipoCoordinadora.controller";
import { GetTurnosSemanalesTrabajadorController } from "./controllers/GetTurnosSemanalesTrabajador.controller";
import { GetTurnosEquipoCoordinadoraUseCase } from "./use-cases/GetTurnosEquipoCoordinadora.use-case";

@Module({
  imports: [TrabajadoresModule, CoordinadoraModule],
  providers: [
    { provide: ITurnoRepository, useClass: TurnoRepository },
    GetTurnosEquipoCoordinadoraUseCase,
  ],
  controllers: [
    DeleteTurnoController,
    GetTurnosEquipoCoordinadoraController,
    GetTurnosSemanalesTrabajadorController,
  ],
  exports: [],
})
export class TurnoModule {}
