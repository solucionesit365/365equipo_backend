import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class PlantillaTurnoDatabase {
  constructor(private readonly prismaService: PrismaService) {}

  async createPlantillaTurno(
    nuevaPlantillaTurno: Prisma.PlantillaTurnoCreateInput,
  ) {
    try {
      const plantillaTurno = await this.prismaService.plantillaTurno.create({
        data: nuevaPlantillaTurno,
      });
      return plantillaTurno;
    } catch (error) {
      console.error("Error al crear la plantilla de turno:", error);
      throw new InternalServerErrorException();
    }
  }

  async getPlantillasTurnosTienda(idTienda: number) {
    try {
      const plantillasTurnos = await this.prismaService.plantillaTurno.findMany(
        {
          where: {
            tienda: {
              id: idTienda,
            },
          },
        },
      );
      return plantillasTurnos;
    } catch (error) {
      console.error("Error al obtener las plantillas de turno:", error);
      throw new InternalServerErrorException();
    }
  }
}
