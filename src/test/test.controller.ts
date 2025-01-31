import {
  Controller,
  Post,
  Req,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { Request } from "express";
import * as rawBody from "raw-body";
import { FileInterceptor } from "@nestjs/platform-express";
import { simpleParser } from "mailparser";
import { LoggerService } from "../logger/logger.service";

@Controller("test")
export class TestController {
  constructor(private readonly loggerService: LoggerService) {}

  @Post("email")
  @UseInterceptors(FileInterceptor("email")) // Mantenemos esto por si hay un archivo
  async sendEmail(
    @Req() req: Request,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      // 1. Capturar el body crudo (sin procesar)
      const rawBodyContent = (await rawBody(req)).toString("utf-8");

      // 2. Capturar todas las cabeceras
      const headers = { ...req.headers };

      // 3. Capturar campos del form-data (si existe)
      let formDataFields = {};
      if (req.is("multipart/form-data")) {
        // Solo para multipart, NestJS ya procesó los campos
        // ¡OJO! Esto no captura archivos, solo campos de texto
        formDataFields = req.body;
      }

      // 4. Registrar TODO en el logger
      await this.loggerService.create({
        action: "Debug Power Automate Request",
        name: "Sistema",
        extraData: {
          headers: headers,
          rawBody: rawBodyContent, // Body crudo completo
          detectedFile: file
            ? {
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
              }
            : "No hay archivo subido",
          formDataFields: formDataFields, // Campos de texto del form-data
          error: null,
        },
      });

      // 5. Procesar el email si hay archivo
      if (file) {
        const parsedEmail = await simpleParser(file.buffer);
        // ... (tu lógica existente aquí)
        return "Email procesado";
      }

      return "No se encontró archivo adjunto";
    } catch (error) {
      await this.loggerService.create({
        action: "Error en email",
        name: "Sistema",
        extraData: {
          error: error.message,
          stack: error.stack,
        },
      });
      return "Error interno";
    }
  }
}
