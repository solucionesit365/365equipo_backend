import { Injectable } from "@nestjs/common";
import { MongoDbService } from "../bbdd/mongodb";
import { ObjectId } from "mongodb";
import { cultura365Interface } from "./cultura365.interface";

@Injectable()
export class cultura365Mongo {
  constructor(private readonly mongoDbService: MongoDbService) {}

  async nuevoVideo(video: cultura365Interface) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const videosCollect = db.collection<cultura365Interface>("videosCultura");

    const resInsert = await videosCollect.insertOne(video);

    if (resInsert.acknowledged) return resInsert.insertedId;

    throw Error("No se ha podido crear el video");
  }

  async getVideos() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const videosCollect = db.collection<cultura365Interface>("videosCultura");
    const response = await videosCollect.find({}).toArray();

    return response;
  }

  async incrementarContadorViews(videoId: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const videosCollect = db.collection<cultura365Interface>("videosCultura");

    const resUpdate = await videosCollect.updateOne(
      { _id: new ObjectId(videoId) },
      { $inc: { views: 1 } },
    );

    if (!resUpdate.modifiedCount) {
      throw Error("No se pudo incrementar el contador de vistas del video");
    }
  }

  async views() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const videosCollect = db.collection<cultura365Interface>("videosCultura");

    const vistasPorVideo = await videosCollect
      .aggregate([
        { $project: { _id: 1, views: 1, titulo: 1 } }, // Selecciona los campos _id, views y titulo
      ])
      .toArray();

    return vistasPorVideo;
  }
}