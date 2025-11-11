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
    console.log(video);
    try {
      const resultado = await this.videosInstance.newVideoSupport(video);
      return { ok: true, data: resultado };
    } catch (err) {
      console.error(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("all-videos")
  async getAllVideosSupport() {
    try {
      return {
        ok: true,
        data: await this.videosInstance.getAllVideosSupport(),
      };
    } catch (err) {
      console.error(err);
      return { ok: false, message: err.message };
    }
  }
}
