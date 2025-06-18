import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { Tiendas2 } from "./tiendas.dto";
import { MongoService } from "src/mongo/mongo.service";

@Injectable()
export class TiendaDatabaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mongoDbService: MongoService,
  ) {}
  async getTiendas() {
    return await this.prisma.tienda.findMany();
  }

  async addTiendasNuevas(nuevas: Prisma.TiendaCreateInput[]) {
    const resCreate = await this.prisma.tienda.createMany({
      data: nuevas,
    });

    return !!resCreate.count;
  }

  async getTiendaById(id: number) {
    try {
      return this.prisma.tienda.findFirstOrThrow({
        where: {
          id,
        },
      });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  async geTiendas2() {
    const db = (await this.mongoDbService.getConexion()).db();
    const tiendasResponse = db.collection<Tiendas2>("tiendas");
    const respSolicitudes = await tiendasResponse.find({}).toArray();

    return respSolicitudes;
  }
}
