import { Injectable } from "@nestjs/common";
import { ObjectId } from "mongodb";
import {
  videosFormacion365Interface,
  videosVistosFormacion365Interface,
} from "./videos-formacion.interface";
import { MongoService } from "../mongo/mongo.service";

@Injectable()
export class videosFormacion365Mongo {
  constructor(private readonly mongoDbService: MongoService) {}

  async nuevoVideo(video: videosFormacion365Interface) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const videosCollect =
      db.collection<videosFormacion365Interface>("videosFormacion");

    const resInsert = await videosCollect.insertOne(video);

    if (resInsert.acknowledged) return resInsert.insertedId;

    throw Error("No se ha podido crear el video de formacion");
  }

  async nuevoVistoVideo(videos: videosVistosFormacion365Interface) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const videosCollect = db.collection<videosVistosFormacion365Interface>(
      "videosVistosFormacion",
    );

    const resInsert = await videosCollect.insertOne(videos);

    if (resInsert.acknowledged) return resInsert.insertedId;

    throw Error("No se ha podido crear el video de formacion");
  }

  async getVideos() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const videosCollect =
      db.collection<videosFormacion365Interface>("videosFormacion");
    const response = await videosCollect.find({}).toArray();

    return response;
  }

  async getVideosVistos() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const videosCollect = db.collection<videosVistosFormacion365Interface>(
      "videosVistosFormacion",
    );
    const response = await videosCollect.find({}).toArray();

    return response;
  }

  async findVideoByIdVideo(nombre: string, idVideo: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const videosCollect = db.collection<videosVistosFormacion365Interface>(
      "videosVistosFormacion",
    );

    return await videosCollect.findOne({ nombre: nombre, idVideo: idVideo });
  }

  async updatevideo(video: videosFormacion365Interface) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const videosCollect =
      db.collection<videosFormacion365Interface>("videosFormacion");

    const resUpdate = await videosCollect.updateOne(
      {
        _id: new ObjectId(video._id),
      },
      {
        $set: {
          titulo: video.titulo,
          descripcion: video.descripcion,
          urlVideo: video.urlVideo,
        },
      },
    );

    return resUpdate.acknowledged;
  }

  async deleteVideo(_id: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const videosCollect =
      db.collection<videosFormacion365Interface>("videosFormacion");

    const resDelete = await videosCollect.deleteOne({
      _id: new ObjectId(_id),
    });

    return resDelete.acknowledged && resDelete.deletedCount > 0;
  }

  async incrementarContadorViews(videoId: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const videosCollect =
      db.collection<videosFormacion365Interface>("videosFormacion");

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
    const videosCollect =
      db.collection<videosFormacion365Interface>("videosFormacion");

    const vistasPorVideo = await videosCollect
      .aggregate([{ $project: { _id: 1, views: 1, titulo: 1 } }])
      .toArray();

    return vistasPorVideo;
  }
}
