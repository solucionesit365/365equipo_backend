import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Prisma, Turno } from "@prisma/client";
import { DateTime } from "luxon";
import { PrismaService } from "../../prisma/prisma.service";
import { ITurnoRepository } from "./interfaces/turno.repository.interface";

function construirIncludeContrato(fechaJS: Date): Prisma.TrabajadorInclude {
  return {
    contratos: {
      where: {
        inicioContrato: { lte: fechaJS },
        OR: [{ fechaBaja: null }, { fechaBaja: { gte: fechaJS } }],
        // si usas finalContrato
        // AND: [
        //   { OR: [{ finalContrato: null }, { finalContrato: { gte: fechaJS } }] },
        // ],
      },
      orderBy: { inicioContrato: "desc" }, // <- literal 'desc' (o Prisma.SortOrder.desc)
      take: 1,
    },
  };
}

@Injectable()
export class TurnoRepository implements ITurnoRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createTurno(turno: Prisma.TurnoCreateInput) {
    try {
      return await this.prismaService.turno.create({
        data: turno,
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async createTurnos(turnos: Prisma.TurnoCreateManyInput[]) {
    try {
      return await this.prismaService.turno.createMany({
        data: turnos,
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  /**
   *
   * Retorna los turnos de la semana de "fecha" del trabajador "idTrabajador"
   */
  async getTurnosPorTrabajador(idTrabajador: number, fecha: DateTime) {
    const inicio = fecha.startOf("week");
    const final = fecha.endOf("week");

    try {
      const turnos = await this.prismaService.turno.findMany({
        where: {
          idTrabajador,
          inicio: {
            // Solo inicio, por si la jornada del trabajador termina al día siguiente (no se utiliza final aquí)
            gte: inicio.toJSDate(), // 00:00
            lte: final.toJSDate(), // 23:59
          },
        },
        include: {
          Trabajador: {
            include: construirIncludeContrato(inicio.toJSDate()),
          },
        },
      });
      return turnos;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async getTurnosPorTienda(idTienda: number, fecha: DateTime) {
    try {
      const inicioSemana = fecha.startOf("week").toJSDate();
      const finSemana = fecha.endOf("week").toJSDate();
      const fechaJS = fecha.toJSDate();

      return await this.prismaService.turno.findMany({
        where: {
          tiendaId: idTienda,
          inicio: {
            gte: inicioSemana,
            lte: finSemana,
          },
        },
        include: {
          Trabajador: {
            include: construirIncludeContrato(fechaJS),
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async getTurnosPorEquipo(idResponsableEquipo: number, fecha: DateTime) {
    try {
      const inicio = fecha.startOf("week");
      const final = fecha.endOf("week");

      return await this.prismaService.turno.findMany({
        where: {
          Trabajador: {
            idResponsable: idResponsableEquipo,
          },
          inicio: {
            gte: inicio.toJSDate(),
            lte: final.toJSDate(),
          },
        },
        include: {
          Trabajador: {
            include: construirIncludeContrato(inicio.toJSDate()),
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async deleteTurno(idTurno: string) {
    try {
      return await this.prismaService.turno.delete({
        where: {
          id: idTurno,
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Actualiza todos los turnos del parámetro según el payload. Sobreescribe todo
   */
  async updateManyTurnos(turnos: Turno[]) {
    const updates = turnos.map((turno) =>
      // Estos turnos no se ejecutan en paralelo, necesitan el await. Es una lazy evaluation
      this.prismaService.turno.update({
        where: { id: turno.id },
        data: turno,
      }),
    );
    return this.prismaService.$transaction(updates);
  }
}
