import { Injectable } from "@nestjs/common";
import { CreateVideoSupportDto } from "./videos-support.dto";
import { VideosSupportDatabases } from "./videos-support.mongodb";

@Injectable()
export class VideosSupportClass {
  prisma: any;
  furgonetaModel: any;
  constructor(private readonly schVideosSupport: VideosSupportDatabases) {}

  async newVideoSupport(video: CreateVideoSupportDto) {
    const insertVideo = await this.schVideosSupport.newVideoSupport(video);
    console.log("Insert video", insertVideo);
    if (insertVideo) return true;

    throw new Error("No se ha podido insertar la inspección de furgo");
  }

  async getAllVideosSupport() {
    return this.schVideosSupport.getAllVideosSupport();
  }
}
