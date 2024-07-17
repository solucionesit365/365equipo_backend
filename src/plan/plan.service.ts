import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DateTime } from "luxon";

@Injectable()
export class PlanService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlanesTrabajador(
    idTrabajador: number,
    fechaInicio: DateTime,
    fechaFinal: DateTime,
  ) {
    const planesTrabajador = await this.prisma.plan.findMany({
      where: {
        trabajadorId: idTrabajador,
        inicio: {
          gte: fechaInicio.toJSDate(),
        },
        final: {
          lte: fechaFinal.toJSDate(),
        },
      },
    });

    return planesTrabajador;
  }
}
