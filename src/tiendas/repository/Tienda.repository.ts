import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ITiendaRepository } from "./ITienda.repository";
import { Tienda } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class TiendaRepository implements ITiendaRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getTiendas(): Promise<Tienda[]> {
    try {
      return await this.prismaService.tienda.findMany();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
