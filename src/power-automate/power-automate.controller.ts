import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { PowerAutomateService } from "./power-automate.service";
import { Req, UseInterceptors, UploadedFile } from "@nestjs/common";
import { Request } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { simpleParser } from "mailparser";
import { EmailService } from "../email/email.class";
import { SchedulerGuard } from "../guards/scheduler.guard";

@Controller("power-automate")
export class PowerAutomateController {
  constructor(
    private readonly mongoService: MongoService,
    private readonly powerAutomateService: PowerAutomateService,
    private readonly emailService: EmailService,
  ) {}

  @Post("test")
  async test(@Body() req: { text: string }) {
    try {
      return this.powerAutomateService.getTag("action", req.text);
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  @UseGuards(SchedulerGuard)
  @Post("saveInfoFormResponder")
  async save(@Body() req: { email: string; idTarea: string }) {
    await this.powerAutomateService.saveInPowerAutomateCollection({ ...req });
  }
  @UseGuards(SchedulerGuard)
  @Get("getInfoForm")
  async getInfoFormHandler(@Query("idTarea") idTarea: string) {
    return this.powerAutomateService.getInfoForm(idTarea);
  }

  @Post("email")
  @UseInterceptors(FileInterceptor("email"))
  async receiveEmail(
    @Req() req: Request,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      let parsedEmail: any;

      if (file) {
        parsedEmail = await simpleParser(file.buffer);
      } else {
        parsedEmail = await simpleParser(req.body["email"]);
      }

      if (!parsedEmail) {
        throw new Error("No se pudo parsear el email.");
      }

      const emailData = {
        from: parsedEmail.from?.text || "No especificado",
        to: parsedEmail.to?.text || "No especificado",
        subject: parsedEmail.subject || "Sin asunto",
        text: parsedEmail.text || "Sin contenido",
      };

      const action = this.powerAutomateService.getTag("action", emailData.text);
      const parsedData = JSON.parse(emailData.text);
      const qr = await this.powerAutomateService.createGreenPass(parsedData);
      await this.emailService.sendFactoryVisitEmail(
        parsedData.email,
        {
          nombre: parsedData.nombre,
          empresa: parsedData.empresa,
        },
        qr,
      );
      await this.powerAutomateService.saveInPowerAutomateCollection({
        action,
        name: "Tarea",
        extraData: parsedData,
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
