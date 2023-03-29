import { Injectable } from "@nestjs/common";
import moment from "moment";
import { ObjectId } from "mongodb";
import { MongoDbService } from "../bbdd/mongodb";
import { AnuncioDto, UpdateAnuncioDto } from "./anuncios.dto";

@Injectable()
export class AnunciosService {
  constructor(private readonly mongoDbService: MongoDbService) {}

  async getAnuncios(idTienda: number) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const anuncios = db.collection<AnuncioDto>("anuncios");

    if (idTienda) {
      return await anuncios.find({ tiendas: { $in: [idTienda] } }).toArray();
    }
    return await anuncios.find({}).toArray();
  }

  async addAnuncio(anuncio: AnuncioDto) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const anuncios = db.collection<AnuncioDto>("anuncios");

    const resInsert = await anuncios.insertOne(anuncio);

    if (resInsert.acknowledged) return resInsert.insertedId;
    return null;
  }

  async updateAnuncio(anuncio: UpdateAnuncioDto) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const anuncios = db.collection<AnuncioDto>("anuncios");

    const resUpdate = await anuncios.updateOne(
      {
        _id: new ObjectId(anuncio._id),
      },
      {
        $set: {
          caducidad: moment(anuncio.caducidad, "DD/MM/YYYY").toDate(),
          categoria: anuncio.categoria,
          descripcion: anuncio.descripcion,
          fotoPath: anuncio.fotoPath,
          titulo: anuncio.titulo,
        },
      },
    );

    return resUpdate.acknowledged;
  }

  async deleteAnuncio(_id: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const anuncios = db.collection<AnuncioDto>("anuncios");

    const resDelete = await anuncios.deleteOne({
      _id: new ObjectId(_id),
    });

    return resDelete.acknowledged;
  }
}
