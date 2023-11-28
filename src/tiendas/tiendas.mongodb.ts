import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import { Tienda } from "./tiendas.dto";
import { ObjectId } from "mongodb";

@Injectable()
export class tiendasMongodb {
  constructor(private readonly mongoDbService: MongoDbService) {}

  async getTiendas() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const tiendas = db.collection<Tienda>("tiendas");

    return await tiendas.find({}).toArray();
  }

  async getTiendasHitMongoDb() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const tiendas = db.collection<Tienda>("tiendas");

    const filtro = {
      nombre: {
        $not: {
          $regex: "antigua|vieja|no",
          $options: "i",
        },
      },
      codi: { $ne: null },
    };

    return await tiendas.find(filtro).sort({ nombre: 1 }).toArray();
  }

  async addTiendasNuevasMongoDb(nuevasTiendas) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const tiendas = db.collection<Tienda>("tiendas");

    const documentos = nuevasTiendas.map((tienda) => ({
      nombre: tienda.nombre,
      direccion: tienda.direccion,
      idExterno: tienda.id,
    }));

    const resultado = await tiendas.insertMany(documentos);
    return resultado.insertedCount === nuevasTiendas.length;
  }
}
