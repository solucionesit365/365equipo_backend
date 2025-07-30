import { Module } from "@nestjs/common";
import { PlantillaTurnoRepository } from "./plantilla-turno.repository";
import { PlantillaTurnoController } from "./plantilla-turno.controller";
import { PlantillaTurnoDatabase } from "./plantilla-turno.database";

@Module({
  providers: [PlantillaTurnoRepository, PlantillaTurnoDatabase],
  controllers: [PlantillaTurnoController],
})
export class PlantillaTurnoModule {}
