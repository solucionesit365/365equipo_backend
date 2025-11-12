import { Injectable } from "@nestjs/common";
import { CreateVideoSupportDto } from "./videos-support.dto";
import { VideosSupportDatabases } from "./videos-support.mongodb";

@Injectable()
export class VideosSupportClass {
  prisma: any;
  furgonetaModel: any;
  constructor(private readonly schVideosSupport: VideosSupportDatabases) {}

  async newVideoSupport(video: CreateVideoSupportDto) {
    return await this.schVideosSupport.newVideoSupport(video);
  }

  async getAllVideosSupport() {
    return this.schVideosSupport.getAllVideosSupport();
  }
}
