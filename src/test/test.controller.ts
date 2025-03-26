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
  @UseInterceptors(FileInterceptor("email")) // Capturamos el archivo `email` si existe
  async receiveEmail(
    @Req() req: Request,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      let parsedEmail;

      if (file) {
        // 📩 1️⃣ Si se recibe un archivo adjunto, parsearlo normalmente
        parsedEmail = await simpleParser(file.buffer);
      } else {
        // 🔎 2️⃣ Si no hay archivo, intentar extraerlo desde `req.body`
        parsedEmail = await simpleParser(req.body["email"]);
      }

      if (!parsedEmail) {
        throw new Error("No se pudo parsear el email.");
      }

      // 📌 3️⃣ Extraer información clave
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

      // 📝 4️⃣ Guardar en logs
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
