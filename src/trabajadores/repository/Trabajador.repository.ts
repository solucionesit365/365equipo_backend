import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ITrabajadorRepository } from "./interfaces/ITrabajador.repository";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma, Trabajador } from "@prisma/client";

@Injectable()
export class TrabajadorRepository implements ITrabajadorRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    newTrabajador: Prisma.TrabajadorCreateInput,
  ): Promise<Trabajador> {
    try {
      return await this.prismaService.trabajador.create({
        data: newTrabajador,
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async readOne(id: number): Promise<Trabajador> {
    try {
      return await this.prismaService.trabajador.findUnique({
        where: { id },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async readByDni(dni: string): Promise<Trabajador | null> {
    try {
      return await this.prismaService.trabajador.findUnique({
        where: { dni },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async readByPerceptorAndEmpresa(
    nPerceptor: number,
    empresaId: string,
  ): Promise<Trabajador | null> {
    try {
      return await this.prismaService.trabajador.findFirst({
        where: {
          nPerceptor: nPerceptor,
          empresaId: empresaId,
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async readAll(filters?: {
    sonPersonas?: boolean;
    sonTiendas?: boolean;
  }): Promise<Trabajador[]> {
    try {
      let where: Prisma.TrabajadorWhereInput = {};

      if (filters?.sonPersonas) {
        where.esTienda = false;
      }
      if (filters?.sonTiendas) {
        where.esTienda = true;
      }

      return await this.prismaService.trabajador.findMany({ where });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async updateOne(
    id: number,
    payload: Prisma.TrabajadorUpdateInput,
  ): Promise<Trabajador> {
    try {
      return await this.prismaService.trabajador.update({
        where: { id },
        data: payload,
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async deleteOne(id: number): Promise<boolean> {
    try {
      const resDelete = await this.prismaService.trabajador.delete({
        where: { id },
      });

      return !!resDelete;
    } catch (error) {
      console.error(`Error eliminando trabajador ID ${id}:`, {
        code: error.code,
        message: error.message,
        meta: error.meta,
      });
      throw new InternalServerErrorException(
        `Error eliminando trabajador ID ${id}`,
      );
    }
  }
}
