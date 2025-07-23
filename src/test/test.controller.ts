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
import { AxiosBcService } from "../axios/axios-bc.service";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../email/email.class";

@Controller("test")
export class TestController {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly axiosBCService: AxiosBcService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  @Post("test")
  test() {
    this.emailService.enviarEmail(
      "ezequielcarissimo@grupohorreols.com",
      "Prueba sendgrid",
      "Prueba para SAI con Cristian",
    );
    return 1;
  }

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

  @Post("apieze")
  async apieze() {
    try {
      const empresaID = "84290dc4-6e90-ef11-8a6b-7c1e5236b0db";
      const data = await this.axiosBCService.getAxios().get(
        // `Production/api/Miguel/365ObradorAPI/v1.0/companies(${empresaID})/perceptoresQuery`,
        `Production/api/eze/365ObradorAPI/v1.0/companies(${empresaID})/PerceptorsExtraData`,
      );

      return data.data;
    } catch (err) {
      console.log(err);
      return;
    }
  }

  // @Post("experimentoRompible")
  // async experimentoRompible() {
  //   const DEFAULT_ROLE_ID = "b3f04be2-35f5-46d0-842b-5be49014a2ef";
  //   const trabajadoresSinRoles = await this.prisma.trabajador.findMany({
  //     where: {
  //       roles: { none: {} },
  //     },
  //     select: { id: true },
  //   });
  //   // return trabajadoresSinRoles;
  //   for (const trabajador of trabajadoresSinRoles) {
  //     await this.prisma.trabajador.update({
  //       where: { id: trabajador.id },
  //       data: {
  //         roles: {
  //           connect: [{ id: DEFAULT_ROLE_ID }],
  //         },
  //       },
  //     });
  //   }
  // }
}
