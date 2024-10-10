import {
  Controller,
  Post,
  UploadedFile,
  Body,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { StorageService } from "./storage.service";
import { UploadFileDto } from "./storage.dto";
import { Express } from "express"; // Importa Express para usar el tipo Multer

@Controller("storage")
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post("uploadFile")
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(
    @Body() uploadFileDto: UploadFileDto,
    @UploadedFile() file: Express.Multer.File, // Ajuste aquí
  ) {
    const fileBuffer = file.buffer;
    const { filePath, contentType } = uploadFileDto;

    try {
      const url = await this.storageService.uploadFile(
        filePath,
        fileBuffer,
        contentType,
      );
      return { url };
    } catch (error) {
      console.error("Error uploading file", error);
      throw error;
    }
  }
}
