import {
  Injectable,
  InternalServerErrorException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateVideoDto } from "./videos.dto";
import { StorageService } from "../storage/storage.service";

@Injectable()
export class VideosService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async createVideo(data: CreateVideoDto, pathFile: string, hash: string) {
    try {
      const newVideo = await this.prismaService.videoFormacion.create({
        data: {
          id: hash, // Utilizando el hash como ID
          category: data.category,
          duration: data.duration,
          name: data.name,
          pathFile,
        },
      });

      if (!newVideo)
        throw new InternalServerErrorException("Error creating video");

      return newVideo;
    } catch (error) {
      if (error) {
        if (error.code === "P2002") {
          throw new ConflictException("El vídeo ya existe en la base de datos");
        }
      }
      console.error("Error creating video", error);
      // Si ocurre algún error, eliminamos el archivo
      await this.storageService.deleteFile(pathFile);
      throw new InternalServerErrorException("Error creating video");
    }
  }

  async getVideos() {
    return await this.prismaService.videoFormacion.findMany();
  }
}
