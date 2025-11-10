import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { VideosSupportClass } from "./videos-support.class";
import { CreateVideoSupportDto } from "./videos-support.dto";
import { AuthGuard } from "src/guards/auth.guard";

@Controller("videos-support")
export class VideosSupportController {
  [x: string]: any;
  constructor(private readonly inspeccionesInstance: VideosSupportClass) {}

  @UseGuards(AuthGuard)
  @Post("new-video")
  async newVideoSupport(@Body() video: CreateVideoSupportDto) {
    try {
      const data = await this.newVideoSupport({
        title: video.title,
        url: video.url,
      });
      return { ok: true, data };
    } catch (err) {
      console.error(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("all-videos")
  async getAllVideosSupport() {
    try {
      const data = await this.getAllVideosSupport();
      return { ok: true, data };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  }
}
