import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import {
  CreatePlantillasTurnosTienda,
  GetPlantillasTurnosTienda,
} from "./plantilla-turno.dto";
import { PlantillaTurnoRepository } from "./plantilla-turno.repository";

@Controller("plantilla-turno")
export class PlantillaTurnoController {
  constructor(
    private readonly plantillaTurnoRepository: PlantillaTurnoRepository,
  ) {}

  @Get()
  async getPlantillasTurnosTienda(@Query() req: GetPlantillasTurnosTienda) {
    return this.plantillaTurnoRepository.getPlantillasTurnosTienda(
      req.idTienda,
    );
  }

  @Post("create")
  async createPlantillaTurno(
    @Body() nuevaPlantillaTurno: CreatePlantillasTurnosTienda,
  ) {
    return this.plantillaTurnoRepository.createPlantillaTurno({
      inicio: nuevaPlantillaTurno.inicio,
      final: nuevaPlantillaTurno.final,
      nombre: nuevaPlantillaTurno.nombre,
      tienda: {
        connect: {
          id: nuevaPlantillaTurno.idTienda,
        },
      },
      order: nuevaPlantillaTurno.order,
    });
  }
}
