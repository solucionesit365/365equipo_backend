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
  async sendEmail(@Req() req: Request) {
    try {
      // Obtén el cuerpo RAW
      const rawEmail = await rawBody(req, {
        encoding: true, // Asegura que el cuerpo sea tratado como un string
      });

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
      this.loggerService.create({
        action: "error webhook",
        name: "Eze Test",
        extraData: req,
      });
      return "Error interno";
    }
  }
}
