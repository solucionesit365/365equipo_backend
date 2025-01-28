import {
  Controller,
  Get,
  Post,
  UseGuards,
  Body,
  UseInterceptors,
  UploadedFile,
  Req,
} from "@nestjs/common";
import { simpleParser } from "mailparser";
import { Roles } from "../decorators/role.decorator";
import { RoleGuard } from "../guards/role.guard";
import { AuthGuard } from "../guards/auth.guard";
import { PrismaService } from "../prisma/prisma.service";
import { LoggerService } from "../logger/logger.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request } from "express";
import * as rawBody from "raw-body";

@Controller("test")
export class TestController {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly loggerService: LoggerService,
  ) {}

  @Post("email")
  @UseInterceptors(FileInterceptor("email")) // Extrae el campo "email" del form-data
  async sendEmail(
    @UploadedFile() file: Express.Multer.File, // Archivo con el RAW MIME
    @Req() req: Request,
  ) {
    try {
      // Verifica si se recibió el archivo
      if (!file) {
        this.loggerService.create({
          action: "Error en email",
          name: "Sistema",
          extraData: {
            error: "Campo 'email' no encontrado",
            tipo: req.rawHeaders,
          },
        });
        return "Campo 'email' faltante";
      }

      // Convierte el buffer a string (RAW MIME)
      const rawEmail = file.buffer.toString();
      const parsedEmail = await simpleParser(rawEmail);

      // Guarda los datos en el log
      this.loggerService.create({
        action: "Prueba 1",
        name: "Eze",
        extraData: {
          quehace: "Envia un email correctamente Eze 28/01/2025",
          emailData: {
            from: parsedEmail.from?.text,
            subject: parsedEmail.subject,
            text: parsedEmail.text,
            attachments: parsedEmail.attachments?.map((a) => a.filename),
          },
        },
      });

      return "Operativo";
    } catch (error) {
      console.error("Error procesando correo:", error);
      return "Error interno";
    }
  }
}
