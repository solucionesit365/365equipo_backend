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
   * Incluye arraySemanalHoras para compatibilidad con el antiguo sistema de cuadrantes
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
          trabajador: {
            include: construirIncludeContrato(inicio.toJSDate()),
          },
        },
      });
      
      // Construir arraySemanalHoras para compatibilidad
      const arraySemanalHoras = this.construirArraySemanalHoras(turnos, inicio);
      
      // Añadir totalHoras a cada turno
      const turnosConHoras = turnos.map(turno => {
        const inicioDateTime = DateTime.fromJSDate(turno.inicio);
        const finalDateTime = DateTime.fromJSDate(turno.final);
        const totalHoras = finalDateTime.diff(inicioDateTime, 'hours').hours;
        
        return {
          ...turno,
          totalHoras: Math.max(0, totalHoras), // Asegurar que no sea negativo
        };
      });
      
      // Si hay turnos, agregar el arraySemanalHoras al primer elemento
      if (turnosConHoras.length > 0) {
        (turnosConHoras as any)[0].arraySemanalHoras = arraySemanalHoras;
      }
      
      return turnosConHoras;
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
          trabajador: {
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
          trabajador: {
            idResponsable: idResponsableEquipo,
          },
          inicio: {
            gte: inicio.toJSDate(),
            lte: final.toJSDate(),
          },
        },
        include: {
          trabajador: {
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

  async getTurnoDelDia(
    idTrabajador: number,
    inicio: DateTime,
    final: DateTime,
  ): Promise<Turno> {
    try {
      return await this.prismaService.turno.findFirst({
        where: {
          idTrabajador: idTrabajador,
          inicio: {
            gte: inicio.toJSDate(),
          },
          final: {
            lt: final.toJSDate(),
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Construye el array semanal de horas a partir de los turnos
   * Para mantener compatibilidad con el antiguo sistema de cuadrantes
   */
  private construirArraySemanalHoras(turnos: Turno[], inicioSemana: DateTime) {
    // Inicializar array con 7 días (lunes a domingo)
    const arraySemanalHoras = Array(7).fill(null).map(() => ({
      horaEntrada: null,
      horaSalida: null,
      idPlan: null,
      idTienda: null,
    }));

    // Mapear turnos a días de la semana
    turnos.forEach((turno) => {
      const fechaTurno = DateTime.fromJSDate(turno.inicio);
      const diaSemana = (fechaTurno.weekday - 1) % 7; // 0 = lunes, 6 = domingo
      
      if (diaSemana >= 0 && diaSemana < 7) {
        arraySemanalHoras[diaSemana] = {
          horaEntrada: DateTime.fromJSDate(turno.inicio).toFormat('HH:mm'),
          horaSalida: DateTime.fromJSDate(turno.final).toFormat('HH:mm'),
          idPlan: turno.id, // Usamos el ID del turno como idPlan
          idTienda: turno.tiendaId,
        };
      }
    });

    return arraySemanalHoras;
  }
}
