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
import { CryptoService } from "../crypto/crypto.class";

@Controller("storage")
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
    private readonly cryptoService: CryptoService,
  ) {}

  @Post("uploadFile")
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(
    @Body() uploadFileDto: UploadFileDto,
    @UploadedFile() file: Express.Multer.File, // Ajuste aquí
  ) {
    if (!file) {
      throw new Error("File is required");
    }
    const fileBuffer = file.buffer;
    const { contentType } = uploadFileDto;

    try {
      const url = await this.storageService.uploadFile(
        "api_firma/sin_csv" + "/" + this.cryptoService.createCsv() + ".pdf",
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
