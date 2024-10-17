import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  InternalServerErrorException,
  Get,
  UseGuards,
} from "@nestjs/common";
import { CreateVideoDto } from "./videos.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { StorageService } from "../storage/storage.service";
import { CryptoService } from "../crypto/crypto.class";
import { VideosService } from "./videos.service";
import { AuthGuard } from "../guards/auth.guard";

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
    const pathFile = await this.storageService.uploadFile(
      "videos/" + hash + "." + extension,
      file.buffer,
      "Content-Type: video/mp4",
    );

    return await this.videoService.createVideo(req, pathFile, hash);
  }

  @UseGuards(AuthGuard)
  @Get()
  async getVideos() {
    return await this.videoService.getVideos();
  }
}
