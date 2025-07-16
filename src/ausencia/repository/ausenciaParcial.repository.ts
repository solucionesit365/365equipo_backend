import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { IAusenciaParcialRepository } from "../interfaces/IAusenciaParcial.repository";
import { AusenciaParcial, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { DateTime } from "luxon";

@Injectable()
export class AusenciaParcialRepository implements IAusenciaParcialRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    nuevaAusencia: Prisma.AusenciaParcialCreateInput,
  ): Promise<AusenciaParcial> {
    try {
      return await this.prismaService.ausenciaParcial.create({
        data: nuevaAusencia,
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async readOne(idAusencia: string) {
    try {
      return await this.prismaService.ausenciaParcial.findUnique({
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
      return await this.prismaService.ausenciaParcial.findMany({
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

  async update(idAusencia: string, payload: Prisma.AusenciaParcialUpdateInput) {
    try {
      return await this.prismaService.ausenciaParcial.update({
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
      return await this.prismaService.ausenciaParcial.delete({
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
