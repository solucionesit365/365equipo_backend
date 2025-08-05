import {
  Controller,
  Post,
  Req,
  UseInterceptors,
  UploadedFile,
  NotFoundException,
  InternalServerErrorException,
  Get,
  Query,
} from "@nestjs/common";
import { Request } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { simpleParser } from "mailparser";
import { LoggerService } from "../logger/logger.service";
import { AxiosBcService } from "../axios/axios-bc.service";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../email/email.class";
import { DateTime } from "luxon";
import { Turno } from "@prisma/client";

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

  @Get("relacionado")
  async testGetTurnoRelacionado(
    @Query() req: { inicio: string; final: string },
  ): Promise<Turno> {
    // 1) Parámetros “a hierro” para la prueba
    const idTrabajador = 3608;
    const dtInicio = DateTime.fromFormat(req.inicio, "dd/MM/yyyy HH:mm");
    const dtFinal = DateTime.fromFormat(req.final, "dd/MM/yyyy HH:mm");

    try {
      // 2) Llamar al método mejorado
      const turnoEncontrado = await this.getTurnoRelacionado(
        idTrabajador,
        dtInicio,
        dtFinal,
      );

      return turnoEncontrado;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      console.error("Error en endpoint de test:", err);
      throw new InternalServerErrorException("Error al ejecutar la prueba");
    }
  }

  async getTurnoRelacionado(
    idTrabajador: number,
    inicio: DateTime,
    final: DateTime,
  ): Promise<Turno> {
    try {
      // 1) Buscar todos los turnos que overlapeen con el intervalo [inicio, final]:
      //    turno.inicio <= final  AND  turno.final >= inicio
      const candidatos: Turno[] = [
        {
          bolsaHorasInicial: 0,
          borrable: false,
          idTrabajador: 3608,
          tiendaId: 999999,
          id: "turno1",
          inicio: DateTime.fromFormat(
            "05/08/2025 08:00",
            "dd/MM/yyyy HH:mm",
          ).toJSDate(),
          final: DateTime.fromFormat(
            "05/08/2025 16:00",
            "dd/MM/yyyy HH:mm",
          ).toJSDate(),
        },
        {
          bolsaHorasInicial: 0,
          borrable: false,
          idTrabajador: 3608,
          tiendaId: 999999,
          id: "turno2",
          inicio: DateTime.fromFormat(
            "05/08/2025 18:00",
            "dd/MM/yyyy HH:mm",
          ).toJSDate(),
          final: DateTime.fromFormat(
            "05/08/2025 22:00",
            "dd/MM/yyyy HH:mm",
          ).toJSDate(),
        },
        {
          bolsaHorasInicial: 0,
          borrable: false,
          idTrabajador: 3608,
          tiendaId: 999999,
          id: "turno3",
          inicio: DateTime.fromFormat(
            "05/08/2025 23:00",
            "dd/MM/yyyy HH:mm",
          ).toJSDate(),
          final: DateTime.fromFormat(
            "06/08/2025 05:00",
            "dd/MM/yyyy HH:mm",
          ).toJSDate(),
        },
      ];

      if (candidatos.length === 0) {
        // No hay ningún turno que concuerde siquiera parcialmente
        throw new NotFoundException("No se encontró ningún turno relacionado");
      }
      if (candidatos.length === 1) {
        // Solo uno → lo devolvemos
        return candidatos[0];
      }

      // 2) Si hay varios, elegir el que *más* se acerque a los registros de inicio/fin.
      let mejor = candidatos[0];
      let mejorScore =
        Math.abs(candidatos[0].inicio.getTime() - inicio.toJSDate().getTime()) +
        Math.abs(candidatos[0].final.getTime() - final.toJSDate().getTime());

      for (const turno of candidatos.slice(1)) {
        const diffInicio = Math.abs(
          turno.inicio.getTime() - inicio.toJSDate().getTime(),
        );
        const diffFinal = Math.abs(
          turno.final.getTime() - final.toJSDate().getTime(),
        );
        const score = diffInicio + diffFinal;

        if (score < mejorScore) {
          mejor = turno;
          mejorScore = score;
        }
      }

      return mejor;
    } catch (error) {
      // Atrapar errores del ORM u otros
      console.error("Error al buscar turno relacionado:", error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException();
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
