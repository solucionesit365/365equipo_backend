import { Injectable } from "@nestjs/common";
import { MongoService } from "src/mongo/mongo.service";
import { CreateVideoSupport, CreateVideoSupportDto } from "./videos-support.dto";

@Injectable()
export class VideosSupportDatabases {
  constructor(private readonly mongoDbService: MongoService) {}

  private async getCollectionVideos() {
    const db = (await this.mongoDbService.getConexion()).db();
    return db.collection<CreateVideoSupport>("videosSupport");
  }

  async newVideoSupport(inspeccion: CreateVideoSupportDto) {
    const collection = await this.getCollectionVideos();
    const resInsert = await collection.insertOne(new CreateVideoSupport(
      inspeccion.title,
      inspeccion.url,
      inspeccion.embededUrl(),
    ));
    if (resInsert.acknowledged) return resInsert.insertedId;
    throw new Error("No se ha podido insertar el video de soporte");
  }

    async getAllVideosSupport() {
    const collection = await this.getCollectionVideos();
    return await collection.find({}).sort({ fecha: -1 }).toArray();
  }
}