import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { VideosSupportClass } from "./videos-support.class";
import { CreateVideoSupportDto } from "./videos-support.dto";
import { AuthGuard } from "src/guards/auth.guard";

@Controller("videos-support")
export class VideosSupportController {
  constructor(private readonly videosInstance: VideosSupportClass) {}

  @UseGuards(AuthGuard)
  @Post("new-video")
  async newVideoSupport(@Body() video: CreateVideoSupportDto) {
    return await this.videosInstance.newVideoSupport(video);
  }

  @UseGuards(AuthGuard)
  @Get("all-videos")
  async getAllVideosSupport() {
    return await this.videosInstance.getAllVideosSupport();
  }
}
