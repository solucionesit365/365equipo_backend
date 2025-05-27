import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { Tiendas2 } from "./tiendas.dto";
import { IMongoService } from "../mongo/mongo.interface";

@Injectable()
export class TiendaDatabaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mongoDbService: IMongoService,
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

  async geTiendas2() {
    const db = (await this.mongoDbService.getConexion()).db();
    const tiendasResponse = db.collection<Tiendas2>("tiendas");
    const respSolicitudes = await tiendasResponse.find({}).toArray();

    return respSolicitudes;
  }
}
