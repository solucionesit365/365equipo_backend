import { Body, Controller, Post } from "@nestjs/common";
import { TestDto } from "./power-automate.dto";
import { MongoService } from "../mongo/mongo.service";
import { PowerAutomateService } from "./power-automate.service";
import { Req, UseInterceptors, UploadedFile } from "@nestjs/common";
import { Request } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { simpleParser } from "mailparser";

@Controller("power-automate")
export class PowerAutomateController {
  constructor(
    private readonly mongoService: MongoService,
    private readonly powerAutomateService: PowerAutomateService,
  ) {}

  @Post("test")
  async test(@Body() req: TestDto) {
    try {
      const db = (await this.mongoService.getConexion()).db("soluciones");
      const powerAutomateCollection = db.collection("power-automate");
      await powerAutomateCollection.insertOne(req);
      return "OK";
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  @Post("email")
  @UseInterceptors(FileInterceptor("email")) // Capturamos el archivo `email` si existe
  async receiveEmail(
    @Req() req: Request,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      let parsedEmail: any;

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
      await this.powerAutomateService.saveInPowerAutomateCollection({
        action: "Email recibido",
        name: "Sistema",
        extraData: emailData,
      });

      return { message: "Correo procesado", ...emailData };
    } catch (error) {
      await this.powerAutomateService.saveInPowerAutomateCollection({
        action: "Error procesando email",
        name: "Sistema",
        extraData: { error: error.message, stack: error.stack },
      });
      return { message: "Error interno", error: error.message };
    }
  }
}
