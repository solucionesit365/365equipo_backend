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
import { CreateVideoDto, DeleteVideoDto, UpdateVideoDto } from "./videos.dto";
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
}
