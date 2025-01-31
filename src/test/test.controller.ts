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
  @UseInterceptors(FileInterceptor("email"))
  async sendEmail(
    @Req() req: Request,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      // Accede al raw body desde el request (capturado por el middleware)
      const rawBodyContent =
        req["rawBody"]?.toString() || "No se capturó raw body";

      // Log de todo
      await this.loggerService.create({
        action: "Debug Power Automate Request",
        name: "Sistema",
        extraData: {
          headers: { ...req.headers },
          rawBody: rawBodyContent, // Raw body obtenido del middleware
          detectedFile: file
            ? {
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
              }
            : "No hay archivo subido",
          formDataFields: req.body, // Campos del form-data
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
