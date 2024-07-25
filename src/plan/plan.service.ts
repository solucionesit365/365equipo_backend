import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DateTime } from "luxon";
import { ParFichajeService } from "../par-fichaje/par-fichaje.service";
import { Plan } from "@prisma/client";

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

  // Esto devuelve un array con los ids numéricos de las tiendas en las que ha trabajado un trabajador
  private async getPuestosDeTrabajoPorTrabajador(
    idTrabajador: number,
    inicioSemana: DateTime,
    finalSemana: DateTime,
  ): Promise<number[]> {
    const cuadrantesTrabajador = await this.getPlanesTrabajador(
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

  async recuentoTiendasSubordinados(
    arrayTrabajadores: number[],
    inicioSemana: DateTime,
    finalSemana: DateTime,
  ): Promise<number[]> {
    const tiendasSet = new Set<number>();

    for (const idTrabajador of arrayTrabajadores) {
      const planesTrabajador = await this.getPlanesTrabajador(
        idTrabajador,
        inicioSemana,
        finalSemana,
      );

      for (const plan of planesTrabajador) {
        tiendasSet.add(plan.idTienda);
      }
    }

    return [...tiendasSet];
  }

  async getPlanesDependienta(idTrabajador: number, fechaBusqueda: DateTime) {
    const fechaInicioSemana = fechaBusqueda.startOf("week");
    const fechaFinalSemana = fechaBusqueda.endOf("week");
    const planes: Plan[] = [];
    const puestosTrabajo = await this.getPuestosDeTrabajoPorTrabajador(
      idTrabajador,
      fechaInicioSemana,
      fechaFinalSemana,
    );

    for (let i = 0; i < puestosTrabajo.length; i += 1) {
      // Buscar planes entre fechaInicioSemana y fechaFinalSemana y con idTienda = a cualquiera de los puestos de trabajo del array puestosTrabajo, no solo para  una posición.
      const planes = await this.prisma.plan.findMany({
        where: {
          idTienda: {
            in: puestosTrabajo,
          },
          inicio: {
            gte: fechaInicioSemana.toJSDate(),
          },
          final: {
            lte: fechaFinalSemana.toJSDate(),
          },
        },
      });

      planes.push(...planes);
    }

    return planes;
  }

  async getPlanesCoordinadora(
    idTrabajador: number,
    arrayIdSubordinados: number[],
    fechaBusqueda: DateTime,
    idTienda: number,
  ): Promise<Plan[]> {
    const fechaInicioSemana = fechaBusqueda.startOf("week");
    const fechaFinalSemana = fechaBusqueda.endOf("week");
    const planesSubordinados = await this.getPlanesSubordinados(
      arrayIdSubordinados,
      fechaInicioSemana,
      fechaFinalSemana,
    );
    const planesPropiosCordinadora = await this.getPlanesTrabajador(
      idTrabajador,
      fechaInicioSemana,
      fechaFinalSemana,
    );

    const planesExternosTienda = await this.getPlanesByTienda(
      idTienda,
      fechaInicioSemana,
      fechaFinalSemana,
    );

    const allPlanes = [
      ...planesSubordinados,
      ...planesPropiosCordinadora,
      ...planesExternosTienda,
    ];

    const uniqueMap: Map<string, Plan> = new Map();

    allPlanes.forEach((plan) => {
      const id = plan.id.toString();
      uniqueMap.set(id, plan);
    });

    const planesUnicos = Array.from(uniqueMap.values());

    return planesUnicos;
  }

  async getPlanesByTienda(
    idTienda: number,
    fechaInicioBusqueda: DateTime,
    fechaFinalBusqueda: DateTime,
  ) {
    const planesTienda = await this.prisma.plan.findMany({
      where: {
        idTienda: idTienda,
        inicio: {
          gte: fechaInicioBusqueda.toJSDate(),
        },
        final: {
          lte: fechaFinalBusqueda.toJSDate(),
        },
      },
    });

    return planesTienda;
  }

  async getPlanesSubordinados(
    arrayIdsSubordinados: number[],
    fechaInicioBusqueda: DateTime,
    fechaFinalBusqueda: DateTime,
  ) {
    const planesSubordinados = await this.prisma.plan.findMany({
      where: {
        trabajadorId: {
          in: arrayIdsSubordinados,
        },
        inicio: {
          gte: fechaInicioBusqueda.toJSDate(),
        },
        final: {
          lte: fechaFinalBusqueda.toJSDate(),
        },
      },
    });

    return planesSubordinados;
  }

  async getPlanesSupervisora(
    idTienda: number,
    fechaBusqueda: DateTime,
  ): Promise<Plan[]> {
    const fechaInicioSemana = fechaBusqueda.startOf("week");
    const fechaFinalSemana = fechaBusqueda.endOf("week");

    return await this.getPlanesByTienda(
      idTienda,
      fechaInicioSemana,
      fechaFinalSemana,
    );
  }

  // Last year only
  async getTodo() {
    return await this.prisma.plan.findMany({
      where: {
        inicio: {
          gte: DateTime.now().minus({ years: 1 }).toJSDate(),
        },
      },
    });
  }

  async getTodoOneWeek(fechaInicio: DateTime, fechaFinal: DateTime) {
    return await this.prisma.plan.findMany({
      where: {
        inicio: {
          gte: fechaInicio.toJSDate(),
        },
        final: {
          lte: fechaFinal.toJSDate(),
        },
      },
    });
  }

  async guardarCuadrantes(planesModificables: Plan[], planesNuevos: Plan[]) {
    // 1. Modificar los planes existentes
    for (const plan of planesModificables) {
      const { id, ...dataToUpdate } = plan;

      await this.prisma.plan.update({
        where: {
          id: id,
        },
        data: dataToUpdate,
      });
    }

    // 2. Insertar nuevos cuadrantes
    if (planesNuevos.length > 0) {
      await this.prisma.plan.createMany({
        data: planesNuevos,
      });
    }
  }
}
