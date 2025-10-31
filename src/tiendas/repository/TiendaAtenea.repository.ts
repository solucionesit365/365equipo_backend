import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ITiendaAteneaRepository } from "./ITiendaAtenea.repository";
import { Tiendas2 } from "../tiendas.dto";
import { MongoService } from "../../mongo/mongo.service";

@Injectable()
export class TiendaAteneaRepository implements ITiendaAteneaRepository {
  constructor(private readonly mongoService: MongoService) {}

  async getTiendasAtenea(): Promise<Tiendas2[]> {
    try {
      const db = (await this.mongoService.getConexion()).db();
      const tiendasCollection = db.collection<Tiendas2>("tiendas");
      const tiendas = await tiendasCollection.find({}).toArray();
      return tiendas;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
