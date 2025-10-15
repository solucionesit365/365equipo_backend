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

  async addTiendas2(nuevas: Tiendas2) {
    try {
      const db = (await this.mongoDbService.getConexion()).db();
      const tiendasCollection = db.collection<Tiendas2>("tiendas");
      const result = await tiendasCollection.insertOne(nuevas);
      console.log("Insert result:", result);
      return result.acknowledged;
    } catch (err) {
      console.error("Error al insertar tiendas en MongoDB:", err);
    }
  }

  async editTienda(tienda: Tiendas2) {
    try {
      const db = (await this.mongoDbService.getConexion()).db();
      const tiendasCollection = db.collection<Tiendas2>("tiendas");
      const result = await tiendasCollection.updateOne(
        { id: tienda.id },
        { $set: tienda },
      );
      console.log("Update result:", result);
      return result.modifiedCount > 0;
    } catch (err) {
      console.error("Error al editar tienda en MongoDB:", err);
      return false;
    }
  }

  async deleteTienda(id: number) {
    try {
      const db = (await this.mongoDbService.getConexion()).db();
      const tiendasCollection = db.collection<Tiendas2>("tiendas");
      const result = await tiendasCollection.deleteOne({ id });
      console.log("Delete result:", result);
      return result.deletedCount > 0;
    } catch (err) {
      console.error("Error al eliminar tienda en MongoDB:", err);
      return false;
    }
  }
}
