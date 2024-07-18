import { Injectable } from "@nestjs/common";
import { DateTime } from "luxon";
import { PrismaService } from "../prisma/prisma.service";
import { PlanService } from "../plan/plan.service";

@Injectable()
export class TrabajadorPuestoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly planService: PlanService,
  ) {}
  // Esto devuelve un array con los ids numéricos de las tiendas en las que ha trabajado un trabajador
  async getPuestosDeTrabajoPorTrabajador(
    idTrabajador: number,
    inicioSemana: DateTime,
    finalSemana: DateTime,
  ): Promise<number[]> {
    const cuadrantesTrabajador = await this.planService.getPlanesTrabajador(
      idTrabajador,
      inicioSemana,
      finalSemana,
    );

    const tiendasSet = new Set<number>();

    for (const cuadrante of cuadrantesTrabajador) {
      tiendasSet.add(cuadrante.idTienda);
    }

    return [...tiendasSet];
  }
}
