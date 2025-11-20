import { Injectable } from "@nestjs/common";
import { ObjectId } from "mongodb";
import { culture365Interface } from "./culture365.interface";
import { MongoService } from "../mongo/mongo.service";

@Injectable()
export class culture365Mongo {
  constructor(private readonly mongoDbService: MongoService) {}

  async newVideo(video: culture365Interface) {
    const db = (await this.mongoDbService.getConexion()).db();
    const videosCollect = db.collection<culture365Interface>("videosCulture");

    const resInsert = await videosCollect.insertOne(video);

    if (resInsert.acknowledged) return resInsert.insertedId;

    throw Error("No se ha podido crear el video");
  }

  async getVideos() {
    const db = (await this.mongoDbService.getConexion()).db();
    const videosCollect = db.collection<culture365Interface>("videosCulture");
    const response = await videosCollect.find({}).toArray();

    return response;
  }

  async updatevideo(video: culture365Interface) {
    const db = (await this.mongoDbService.getConexion()).db();
    const videosCollect = db.collection<culture365Interface>("videosCulture");

    const resUpdate = await videosCollect.updateOne(
      {
        _id: new ObjectId(video._id),
      },
      {
        $set: {
          title: video.title,
          description: video.description,
          urlVideo: video.urlVideo,
        },
      },
    );

    return resUpdate.acknowledged;
  }

  async deleteVideo(_id: string) {
    const db = (await this.mongoDbService.getConexion()).db();
    const videosCollect = db.collection<culture365Interface>("videosCulture");

    const resDelete = await videosCollect.deleteOne({
      _id: new ObjectId(_id),
    });

    return resDelete.acknowledged && resDelete.deletedCount > 0;
  }

  async increaseViewCounter(videoId: string) {
    const db = (await this.mongoDbService.getConexion()).db();
    const videosCollect = db.collection<culture365Interface>("videosCulture");

    const resUpdate = await videosCollect.updateOne(
      { _id: new ObjectId(videoId) },
      { $inc: { views: 1 } },
    );

    if (!resUpdate.modifiedCount) {
      throw Error("No se pudo incrementar el contador de vistas del video");
    }
  }

  async views() {
    const db = (await this.mongoDbService.getConexion()).db();
    const videosCollect = db.collection<culture365Interface>("videosCulture");

    const viewsByVideo = await videosCollect
      .aggregate([
        { $project: { _id: 1, views: 1, title: 1 } }, // Selecciona los campos _id, views y titulo
      ])
      .toArray();

    return viewsByVideo;
  }
}
