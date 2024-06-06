import { Injectable } from "@nestjs/common";
import { videosFormacion365Mongo } from "./videos-formacion.mongodb";
import {
  videosFormacion365Interface,
  videosVistosFormacion365Interface,
} from "./videos-formacion.interface";

@Injectable()
export class videosFormacion365Class {
  constructor(private readonly videosDB: videosFormacion365Mongo) {}

  async nuevoVideo(video: videosFormacion365Interface) {
    const response = await this.videosDB.nuevoVideo(video);

    if (response) {
      return true;
    }
  }

  async nuevoVistoVideo(video: videosVistosFormacion365Interface) {
    const response = await this.videosDB.nuevoVistoVideo(video);

    if (response) {
      return true;
    }
  }

  async getVideos() {
    const response = await this.videosDB.getVideos();
    return response;
  }

  async getVideosVistos() {
    const response = await this.videosDB.getVideosVistos();
    return response;
  }

  async updateVideo(video: videosFormacion365Interface) {
    return await this.videosDB.updatevideo(video);
  }

  async deleteVideo(_id: string) {
    return await this.videosDB.deleteVideo(_id);
  }

  async incrementarContadorViews(videoId: string) {
    return await this.videosDB.incrementarContadorViews(videoId);
  }

  async views() {
    return await this.videosDB.views();
  }

  async findVideoByIdVideo(nombre: string, idVideo: string) {
    return await this.videosDB.findVideoByIdVideo(nombre, idVideo);
  }
}
