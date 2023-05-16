import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailClass {
  private transporter: any;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  async enviarEmail(to: string, mensaje: string, asunto: string) {
    if (to && mensaje && asunto)
      await this.transporter.sendMail({
        from: "noreply@365equipo.com",
        to: to,
        subject: asunto,
        html: mensaje,
      });
    else throw Error("Faltan datos en enviarEmail");
  }
}
