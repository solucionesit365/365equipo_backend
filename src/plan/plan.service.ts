import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DateTime } from "luxon";
import { ParFichajeService } from "../par-fichaje/par-fichaje.service";

@Injectable()
export class PlanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly parFichajeService: ParFichajeService,
  ) {}

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

  async borrarPlan(idPlan: string) {
    const plan = await this.prisma.plan.delete({
      where: {
        id: idPlan,
      },
    });

    return plan;
  }

  public async getBolsaInicialById(
    idTrabajador: number,
    fechaEntreSemana: DateTime,
    horasContrato: number,
  ) {
    return (
      horasContrato +
      (await this.getHorasMasMenos(idTrabajador, fechaEntreSemana))
    );
  }

  private async getHorasMasMenos(
    idTrabajador: number,
    fechaEntreSemana: DateTime,
  ) {
    const lunesActual = fechaEntreSemana.startOf("week");
    const lunesAnterior = lunesActual.minus({ days: 7 }).startOf("week");
    const domingoAnterior = lunesAnterior.endOf("week");

    const paresValidados = await this.parFichajeService.getParesValidadosById(
      lunesAnterior,
      domingoAnterior,
      idTrabajador,
    );

    let horasMasMenos = 0;

    for (let i = 0; i < paresValidados.length; i += 1) {
      horasMasMenos +=
        paresValidados[i].horasExtras +
        paresValidados[i].horasAprendiz +
        paresValidados[i].horasCoordinacion;
    }

    return horasMasMenos;
  }
}
