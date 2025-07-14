import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";
import { PrismaService } from "../prisma/prisma.service";
import { ITurnoRepository } from "./turno.repository.interface";

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

  async getTurnosPorTrabajador(idTrabajador: number, fecha: DateTime) {
    const inicio = fecha.startOf("day");
    const final = fecha.endOf("day");

    try {
      return await this.prismaService.turno.findMany({
        where: {
          idTrabajador,
          inicio: {
            // Solo inicio, por si la jornada del trabajador termina al día siguiente (no se utiliza final aquí)
            gte: inicio.toJSDate(), // 00:00
            lte: final.toJSDate(), // 23:59
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async getTurnosPorTienda(idTienda: number, fecha: DateTime) {
    try {
      const inicio = fecha.startOf("week");
      const final = fecha.endOf("week");

      return await this.prismaService.turno.findMany({
        where: {
          tiendaId: idTienda,
          inicio: {
            gte: inicio.toJSDate(),
            lte: final.toJSDate(),
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
}
