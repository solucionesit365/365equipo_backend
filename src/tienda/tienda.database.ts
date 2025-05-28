import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Tiendas2 } from "./tienda.dto";
import { IMongoService } from "../mongo/mongo.interface";

@Injectable()
export class TiendaDatabaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mongoDbService: IMongoService,
  ) {}

  async getTiendas() {
    try {
      return await this.prisma.tienda.findMany();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Error al obtener las tiendas desde la base de datos",
      );
    }
  }

  // Mongo
  async geTiendas2() {
    try {
      const db = (await this.mongoDbService.getConexion()).db();
      const tiendasResponse = db.collection<Tiendas2>("tiendas");
      const respSolicitudes = await tiendasResponse.find({}).toArray();

      return respSolicitudes;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Error al obtener las tiendas desde MongoDB",
      );
    }
  }
}
