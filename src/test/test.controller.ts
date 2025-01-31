import {
  Controller,
  Post,
  Req,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { Request } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { simpleParser } from "mailparser";
import { LoggerService } from "../logger/logger.service";

@Controller("test")
export class TestController {
  constructor(private readonly loggerService: LoggerService) {}

  @Post("email")
  @UseInterceptors(FileInterceptor("email")) // Capturamos el archivo `email`
  async receiveEmail(
    @Req() req: Request,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      if (!file) {
        throw new Error("No se recibió el archivo del email.");
      }

      // 1️⃣ Parsear el email desde el archivo adjunto
      const parsedEmail = await simpleParser(file.buffer);

      // 2️⃣ Extraer información clave
      const emailData = {
        from: parsedEmail.from?.text || "No especificado",
        to: parsedEmail.to?.text || "No especificado",
        subject: parsedEmail.subject || "Sin asunto",
        text: parsedEmail.text || "Sin contenido",
        html: parsedEmail.html || "Sin contenido HTML",
        attachments: parsedEmail.attachments.map((att) => ({
          filename: att.filename,
          contentType: att.contentType,
          size: att.size,
        })),
      };

      // 3️⃣ Guardar en logs
      await this.loggerService.create({
        action: "Email recibido",
        name: "Sistema",
        extraData: emailData,
      });

      return { message: "Correo procesado", ...emailData };
    } catch (error) {
      await this.loggerService.create({
        action: "Error procesando email",
        name: "Sistema",
        extraData: { error: error.message, stack: error.stack },
      });
      return { message: "Error interno", error: error.message };
    }
  }
}
