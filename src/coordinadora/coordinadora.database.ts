import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CoordinadoraDatabaseService {
  constructor(private readonly prismaService: PrismaService) {}

  async getCoordinadoraPorTienda(idTienda: number) {
    try {
      const coordinadora = await this.prismaService.trabajador.findFirst({
        where: {
          coordinadoraDeLaTienda: {
            id: idTienda,
          },
        },
      });
      return coordinadora;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }
}
