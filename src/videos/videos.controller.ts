import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  InternalServerErrorException,
  Get,
  UseGuards,
  Query,
  Res,
  NotFoundException,
  Headers,
} from "@nestjs/common";
import {
  CreateVideoDto,
  DeleteVideoDto,
  GetInfoVideoDto,
  UpdateVideoDto,
} from "./videos.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { StorageService } from "../storage/storage.service";
import { CryptoService } from "../crypto/crypto.class";
import { VideosService } from "./videos.service";
import { AuthGuard } from "../guards/auth.guard";
import { VideoStreamAuthGuard } from "../guards/video-stream-auth.guard";
import { Response } from "express";

@Controller("videos")
export class VideosController {
  constructor(
    private readonly storageService: StorageService,
    private readonly cryptoService: CryptoService,
    private readonly videoService: VideosService,
  ) {}

  @UseGuards(AuthGuard)
  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadVideo(
    @Body() req: CreateVideoDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new InternalServerErrorException("File is required");

    const extension = file.originalname.split(".").pop();
    const hash = this.cryptoService.hashFile256(file.buffer);
    const relativePath = "videos/" + hash + "." + extension;
    const pathFile = await this.storageService.uploadFile(
      relativePath,
      file.buffer,
      "Content-Type: video/mp4",
    );

    return await this.videoService.createVideo(
      req,
      pathFile,
      hash,
      relativePath,
    );
  }

  @UseGuards(AuthGuard)
  @Get()
  async getVideos() {
    return await this.videoService.getVideos();
  }

  @UseGuards(AuthGuard)
  @Post("delete")
  async deleteVideo(@Body() req: DeleteVideoDto) {
    return await this.videoService.deleteVideo(req.id);
  }

  @UseGuards(AuthGuard)
  @Post("update")
  async updateVideo(@Body() req: UpdateVideoDto) {
    return await this.videoService.updateVideoData(req);
  }

  @UseGuards(AuthGuard)
  @Get("infoVideo")
  async getVideoInfo(@Query() req: GetInfoVideoDto) {
    return await this.videoService.getInfoVideo(req.id);
  }

  @UseGuards(VideoStreamAuthGuard)
  @Get("downloadVideo")
  async downloadVideo(
    @Query("id") id: string,
    @Res() res: Response,
    @Headers("range") range?: string,
  ) {
    try {
      const videoBuffer = await this.videoService.getVideoBuffer(id);
      const videoSize = videoBuffer.length;

      // Si hay un header de range, el cliente está pidiendo solo una parte del video
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : videoSize - 1;
        const chunkSize = end - start + 1;
        const videoChunk = videoBuffer.subarray(start, end + 1);

        // Headers específicos para respuesta parcial
        res.setHeader("Content-Range", `bytes ${start}-${end}/${videoSize}`);
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Content-Length", chunkSize);
        res.setHeader("Content-Type", "video/mp4");
        res.status(206); // Partial Content
        res.send(videoChunk);
      } else {
        // Enviar video completo
        res.setHeader("Content-Type", "video/mp4");
        res.setHeader("Content-Length", videoSize);
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.send(videoBuffer);
      }
    } catch (error) {
      console.error("Error downloading video:", error);

      if (error instanceof NotFoundException) {
        res.status(404).json({ message: "Video no encontrado" });
      } else {
        res.status(500).json({ message: "Error al descargar el video" });
      }
    }
  }
}
