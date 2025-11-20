import { Injectable } from "@nestjs/common";
import { culture365Mongo } from "./culture365.mongodb";
import { culture365Interface } from "./culture365.interface";

@Injectable()
export class culture365Class {
  constructor(private readonly videosDB: culture365Mongo) {}

  async newVideo(video: culture365Interface) {
    const response = await this.videosDB.newVideo(video);

    if (response) {
      return true;
    }
  }

  async getVideos() {
    const response = await this.videosDB.getVideos();
    return response;
  }

  async updateVideo(video: culture365Interface) {
    return await this.videosDB.updatevideo(video);
  }

  async deleteVideo(_id: string) {
    return await this.videosDB.deleteVideo(_id);
  }

  async increaseViewCounter(videoId: string) {
    return await this.videosDB.increaseViewCounter(videoId);
  }

  async views() {
    return await this.videosDB.views();
  }
}
