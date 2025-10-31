import { Tienda } from "@prisma/client";
import { ISupervisorTiendaRepository } from "./ISupervisorTienda.repository";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class SupervisorTiendaRespository
  implements ISupervisorTiendaRepository
{
  constructor(private readonly prismaService: PrismaService) {}
  getTiendasDelSupervisor(): Promise<Tienda[]> {
    return [] as any;
  }
  async updateSupervisoraDeTiendas(
    tiendasIds: number[],
    idSupervisora: number,
  ): Promise<void> {
    try {
      // First, remove this supervisor from all stores they currently supervise
      await this.prismaService.tienda.updateMany({
        where: { supervisorId: idSupervisora },
        data: { supervisorId: null },
      });

      // Then, assign the new stores to this supervisor
      // This also removes those stores from any other supervisor they might have
      await this.prismaService.tienda.updateMany({
        where: { id: { in: tiendasIds } },
        data: { supervisorId: idSupervisora },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
