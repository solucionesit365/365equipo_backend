import { PrismaService } from "../prisma/prisma.service";
import { IContratoDatabaseService } from "./contrato.interface";
import { InternalServerErrorException } from "@nestjs/common";
import { DateTime } from "luxon";

export class ContratoDatabaseService extends IContratoDatabaseService {
  constructor(private prisma: PrismaService) {
    super();
  }

  async getHorasContrato(idSql: number, fecha: DateTime) {
    try {
      return await this.prisma.contrato2.findFirst({
        where: {
          Trabajador: {
            id: idSql,
          },
          fechaAlta: {
            lte: fecha.toJSDate(),
          },
          OR: [
            { fechaBaja: null },
            {
              fechaBaja: {
                gte: fecha.toJSDate(),
              },
            },
          ],
        },
      });
    } catch (error) {
      console.error("Error al obtener las horas del contrato:", error);
      throw new InternalServerErrorException(
        "Error al obtener las horas del contrato",
      );
    }
  }
}
