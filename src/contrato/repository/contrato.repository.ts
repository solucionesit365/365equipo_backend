import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { IContratoRepository, ICreateContratoDto } from "./interfaces/IContrato.repository";
import { Contrato2 } from "@prisma/client";

@Injectable()
export class ContratoRepository implements IContratoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: ICreateContratoDto): Promise<Contrato2> {
    return await this.prisma.contrato2.create({
      data,
    });
  }

  async findByTrabajadorId(idTrabajador: number): Promise<Contrato2[]> {
    return await this.prisma.contrato2.findMany({
      where: { idTrabajador },
      orderBy: { inicioContrato: 'desc' },
    });
  }

  async findActiveByTrabajadorId(idTrabajador: number): Promise<Contrato2 | null> {
    return await this.prisma.contrato2.findFirst({
      where: {
        idTrabajador,
        fechaBaja: null,
      },
      orderBy: { inicioContrato: 'desc' },
    });
  }

  async update(id: string, data: Partial<ICreateContratoDto>): Promise<Contrato2> {
    return await this.prisma.contrato2.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.contrato2.delete({
      where: { id },
    });
  }
}