import { Controller, Post, Req, Body } from "@nestjs/common";
import { Request } from "express";

import { LoggerService } from "../logger/logger.service";

@Controller("test")
export class TestController {
  constructor(private readonly loggerService: LoggerService) {}

  @Post("email")
  async receiveEmail(@Req() req: Request, @Body() body: any) {
    try {
      // Extraer datos esenciales del correo
      const {
        from, // Remitente del correo
        to, // Destinatario
        subject, // Asunto
        text, // Cuerpo en texto plano
        html, // Cuerpo en HTML
        attachments, // Archivos adjuntos (si hay)
      } = body;

      // Registrar en logs (opcional)
      await this.loggerService.create({
        action: "Email recibido",
        name: "Sistema",
        extraData: {
          from,
          to,
          subject,
          text,
          html,
          attachments: attachments ? attachments.length : "Sin adjuntos",
        },
      });

      // Responder con éxito
      return { message: "Correo recibido", subject, text, html };
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
