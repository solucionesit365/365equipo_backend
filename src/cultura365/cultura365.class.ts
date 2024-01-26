import { Injectable } from "@nestjs/common";
import { cultura365Mongo } from "./cultura365.mongodb";
import { cultura365Interface } from "./cultura365.interface";

@Injectable()
export class cultura365Class {
  constructor(private readonly videosDB: cultura365Mongo) {}

  async nuevoVideo(video: cultura365Interface) {
    const response = await this.videosDB.nuevoVideo(video);

    if (response) {
      return true;
    }
  }

  async getVideos() {
    const response = await this.videosDB.getVideos();
    return response;
  }

  async incrementarContadorViews(videoId: string) {
    return await this.videosDB.incrementarContadorViews(videoId);
  }

  async views() {
    return await this.videosDB.views();
  }
}
