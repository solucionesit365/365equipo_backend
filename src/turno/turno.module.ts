import { Module } from "@nestjs/common";
import { TurnoController } from "./turno.controller";
import { TurnoRepositoryService } from "./turno.repository.service";
import { TurnoDatabaseService } from "./turno.database";
import { TurnoService } from "./turno.service";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";
import { CoordinadoraModule } from "../coordinadora/coordinadora.module";

@Module({
  imports: [TrabajadoresModule, CoordinadoraModule],
  controllers: [TurnoController],
  providers: [TurnoRepositoryService, TurnoDatabaseService, TurnoService],
})
export class TurnoModule {}
