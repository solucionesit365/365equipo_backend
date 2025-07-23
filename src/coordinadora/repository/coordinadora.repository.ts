import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ICoordinadoraRepository } from "./interfaces/ICoordinadora.repository";
import { PrismaService } from "../../prisma/prisma.service";
import { Trabajador } from "@prisma/client";

@Injectable()
export class CoordinadoraRepository implements ICoordinadoraRepository {
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

  async getSubordinadosCoordinadora(
    idCoordinadora: number,
  ): Promise<Trabajador[]> {
    try {
      const subordinadosCoordinadora =
        await this.prismaService.trabajador.findMany({
          where: {
            idResponsable: idCoordinadora,
          },
        });
      return subordinadosCoordinadora;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
