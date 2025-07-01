import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

@Injectable()
export class TurnoDatabaseService {
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

  async getTurnosTrabajador(
    idTrabajador: number,
    inicio: DateTime,
    final: DateTime,
  ) {
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

  async getTurnosPorTienda(
    idTienda: number,
    inicio: DateTime,
    final: DateTime,
  ) {
    try {
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

  async getTurnosPorEquipo(
    idResponsableEquipo: number,
    inicio: DateTime,
    final: DateTime,
  ) {
    try {
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
}
