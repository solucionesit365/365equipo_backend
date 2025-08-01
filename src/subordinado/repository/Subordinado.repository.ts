import { Tienda, Trabajador } from "@prisma/client";
import { ISubordinadoRepository } from "./ISubordinado.repository";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class SubordinadoRepository implements ISubordinadoRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getSubordinados(
    idTrabajador: number,
  ): Promise<(Trabajador & { tienda: Tienda })[]> {
    try {
      const subordinados = await this.prismaService.trabajador.findMany({
        where: {
          idResponsable: idTrabajador,
        },
        include: {
          tienda: true,
        },
      });

      return subordinados;
    } catch (error) {
      console.error("Error en getSubordinados:", error);
      throw new InternalServerErrorException(
        `Error al obtener subordinados: ${error.message}`,
      );
    }
  }
}
