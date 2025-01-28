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

@Controller("test")
export class TestController {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly loggerService: LoggerService,
  ) {}

  @Roles("ADMIN", "DEPENDIENTA")
  @UseGuards(AuthGuard, RoleGuard)
  @Post("testRole")
  async testRole() {
    return "Role test";
  }

  @Post("email")
  async sendEmail(@Req() req: Request) {
    try {
      // SendGrid envía el RAW MIME en req.body.email
      const rawEmail = req.body.email;

      if (!rawEmail) {
        this.loggerService.create({
          action: "Error en email",
          name: "Sistema",
          extraData: { error: "Campo 'email' no encontrado en el body" },
        });
        return "Campo 'email' faltante";
      }

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

  @Get()
  test() {
    this.loggerService.create({
      action: "Prueba 1",
      name: "Eze",
      extraData: { edad: 30, club: "FCBARCELONA Y RCentral" },
    });
    return "Operativo";
  }
}
