import { Injectable, Inject, forwardRef } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { FirebaseService } from "../firebase/firebase.service";
import { TrabajadorService } from "../trabajadores/trabajadores.class";

@Injectable()
export class EmailService {
  private transporter: any;

  constructor(private readonly authInstance: FirebaseService) {
    this.transporter = nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: {
        user: "apikey",
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  async enviarEmail(
    to: string,
    mensaje: string,
    asunto: string,
    imagenBase64?: string,
  ) {
    if (to && mensaje && asunto) {
      const mailOptions = {
        from: "noreply@365equipo.com",
        to: to,
        subject: asunto,
        html: mensaje,
        attachments: [],
      };

      if (imagenBase64) {
        mailOptions.attachments.push({
          filename: "imagen.png",
          content: imagenBase64.split("base64,")[1],
          encoding: "base64",
          cid: "123456",
        });
      }

      await this.transporter.sendMail(mailOptions);
    } else {
      throw Error("Faltan datos en enviarEmail");
    }
  }

  async sendMailByUid(uid: string, mensaje: string, asunto: string) {
    const usuario = await this.authInstance.getUserByUid(uid);

    this.enviarEmail(usuario.email, mensaje, asunto);
  }

  // async sendMailById(id: number, mensaje: string, asunto: string) {
  //   const usuario = await this.trabajadorInstance.getTrabajadorBySqlId(id);

  //   this.enviarEmail(usuario.emails, mensaje, asunto);
  // }
}
