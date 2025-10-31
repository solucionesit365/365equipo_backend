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
      await this.prismaService.trabajador.update({
        where: { id: idSupervisora },
        data: {
          supervisa: {
            connect: tiendasIds.map((idTienda) => ({ id: idTienda })),
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
