import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { IParFichajeRepository } from "./IParFichaje.repository";
import { ParFichaje } from "@prisma/client";
import { DateTime } from "luxon";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ParFichajeRepository implements IParFichajeRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getParesFichajeManyTrabajadores(
    trabajadorIds: number[],
    fechaInicio: DateTime,
    fechaFin: DateTime,
  ): Promise<ParFichaje[]> {
    try {
      const paresFichajes = await this.prismaService.parFichaje.findMany({
        where: {
          trabajadorId: {
            in: trabajadorIds,
          },
          entrada: {
            gte: fechaInicio.toJSDate(),
            lte: fechaFin.toJSDate(),
          },
        },
        orderBy: {
          entrada: "desc",
        },
      });

      return paresFichajes;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
