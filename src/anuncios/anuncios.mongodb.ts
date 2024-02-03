import { Injectable } from "@nestjs/common";
import * as moment from "moment";
import { ObjectId } from "mongodb";
import { MongoService } from "../mongo/mongo.service";
import { AnuncioDto, UpdateAnuncioDto } from "./anuncios.dto";

@Injectable()
export class AnunciosDatabaseService {
  constructor(private readonly mongoDbService: MongoService) {
    // Llamando al método para configurar el índice TTL cuando se instancia el servicio
    this.deleteAnunciosCaducidad().catch((err) => {
      console.error("Error setting up TTL index:", err);
    });
  }

  //Eliminacion automatica de los anuncios por su caducidad
  private async deleteAnunciosCaducidad() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const anuncios = db.collection<AnuncioDto>("anuncios");

    // Creando el índice TTL para la propiedad 'caducidad'
    await anuncios.createIndex({ caducidad: 1 }, { expireAfterSeconds: 0 });
  }

  async getAnuncios(idTienda: number) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const anuncios = db.collection<AnuncioDto>("anuncios");

    if (idTienda) {
      return await anuncios
        .find({ tiendas: { $in: [idTienda, -1] } })
        .toArray();
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

    return resDelete.acknowledged && resDelete.deletedCount > 0;
  }

  // async guardarOfertaAnuncio(ofertas: OfertasAnuncios) {
  //   const db = (await this.mongoDbService.getConexion()).db("soluciones");
  //   const anunciosOfertas = db.collection<OfertasAnuncios>("ofertasAnuncios");
  //   const resInsert = await anunciosOfertas.insertOne(ofertas);
  //   if (resInsert.acknowledged) return resInsert.insertedId;
  //   return null;

  // }
}
