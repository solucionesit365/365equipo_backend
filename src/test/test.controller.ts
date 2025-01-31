import { Controller, Post, Req, Body } from "@nestjs/common";
import { Request } from "express";
import * as rawBody from "raw-body";
import { simpleParser } from "mailparser";
import { LoggerService } from "../logger/logger.service";

@Controller("test")
export class TestController {
  constructor(private readonly loggerService: LoggerService) {}

  @Post("email")
  async receiveEmail(@Req() req: Request) {
    try {
      // 1️⃣ Capturar el body en formato raw (SendGrid lo envía como multipart/form-data)
      const rawBodyContent = await rawBody(req, { encoding: "utf-8" });

      // 2️⃣ Parsear el email para extraer los datos
      const parsedEmail = await simpleParser(rawBodyContent);

      // 3️⃣ Extraer información clave
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

      // 4️⃣ Guardar en logs
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
