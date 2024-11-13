import {
  Controller,
  Post,
  UploadedFile,
  Body,
  UseInterceptors,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { StorageService } from "./storage.service";
import { DownloadFileDto, UploadFileDto } from "./storage.dto";
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
    @UploadedFile() file: Express.Multer.File,
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

  @Post("downloadFile")
  async downloadFile(@Body() req: DownloadFileDto, @Res() res: Response) {
    try {
      const fileBuffer = await this.storageService.downloadFile(
        req.relativePath,
      );

      // Configurar los headers para la descarga del PDF
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="documento.pdf"',
        "Content-Length": fileBuffer.length,
      });

      // Enviar el buffer
      return res.send(fileBuffer);
    } catch (error) {
      console.error("Error downloading file", error);
      throw error;
    }
  }

  @Post("downloadVideo")
  async downloadVideo(@Body() req: DownloadFileDto, @Res() res: Response) {
    try {
      const fileBuffer = await this.storageService.downloadFile(
        req.relativePath,
      );

      // Configurar los headers para la descarga del PDF
      res.set({
        "Content-Type": "video/mp4",
        "Content-Length": fileBuffer.length,
      });

      // Enviar el buffer
      return res.send(fileBuffer);
    } catch (error) {
      console.error("Error downloading video", error);
      throw error;
    }
  }
}
