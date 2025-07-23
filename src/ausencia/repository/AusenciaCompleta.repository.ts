import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { IAusenciaCompletaRepository } from "../interfaces/IAusenciaCompleta.repository";
import { AusenciaCompleta, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { DateTime } from "luxon";

@Injectable()
export class AusenciaCompletaRepository implements IAusenciaCompletaRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    nuevaAusencia: Prisma.AusenciaCompletaCreateInput,
  ): Promise<AusenciaCompleta> {
    try {
      return await this.prismaService.ausenciaCompleta.create({
        data: nuevaAusencia,
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async readOne(idAusencia: string) {
    try {
      return await this.prismaService.ausenciaCompleta.findUnique({
        where: {
          id: idAusencia,
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async readMany(yearFilter: number) {
    try {
      return await this.prismaService.ausenciaCompleta.findMany({
        where: {
          fechaInicio: {
            gte: DateTime.fromFormat(
              `${yearFilter}-01-01`,
              "yyyy-MM-dd",
            ).toJSDate(),
            lt: DateTime.fromFormat(
              // Lower than, sin incluir el primer día del año
              `${yearFilter + 1}-01-01`,
              "yyyy-MM-dd",
            ).toJSDate(),
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async update(
    idAusencia: string,
    payload: Prisma.AusenciaCompletaUpdateInput,
  ) {
    try {
      return await this.prismaService.ausenciaCompleta.update({
        where: { id: idAusencia },
        data: payload,
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async delete(idAusencia: string) {
    try {
      return await this.prismaService.ausenciaCompleta.delete({
        where: {
          id: idAusencia,
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
