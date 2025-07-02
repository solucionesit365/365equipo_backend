import { Injectable } from "@nestjs/common";
import { PlantillaTurnoDatabase } from "./plantilla-turno.database";
import { Prisma } from "@prisma/client";

@Injectable()
export class PlantillaTurnoRepository {
  constructor(
    private readonly plantillaTurnoDatabase: PlantillaTurnoDatabase,
  ) {}

  createPlantillaTurno(nuevaPlantillaTurno: Prisma.PlantillaTurnoCreateInput) {
    return this.plantillaTurnoDatabase.createPlantillaTurno(
      nuevaPlantillaTurno,
    );
  }

  getPlantillasTurnosTienda(idTienda: number) {
    return this.plantillaTurnoDatabase.getPlantillasTurnosTienda(idTienda);
  }
}
