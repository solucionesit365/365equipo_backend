import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import { AnuncioDto } from "./anuncios.dto";

@Injectable()
export class AnunciosService {
  constructor(private readonly mongoDbService: MongoDbService) {}

  async getAnuncios(tiendas: number[]) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const anuncios = db.collection<AnuncioDto>("anuncios");
    if (tiendas.includes(-1)) {
      return await anuncios.find().toArray();
    }
    return await anuncios.find({ tiendas: { $all: tiendas } }).toArray();
  }

  async addAnuncio(anuncio: AnuncioDto) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const anuncios = db.collection<AnuncioDto>("anuncios");

    const resInsert = await anuncios.insertOne(anuncio);

    if (resInsert.acknowledged) return resInsert.insertedId;
    return null;
  }
}
