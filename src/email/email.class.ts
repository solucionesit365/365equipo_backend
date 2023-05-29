import { Injectable, Inject, forwardRef } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { AuthService } from "../firebase/auth";
import { Trabajador } from "../trabajadores/trabajadores.class";

@Injectable()
export class EmailClass {
  private transporter: any;

  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authInstance: AuthService,
    @Inject(forwardRef(() => Trabajador))
    private readonly trabajadorInstance: Trabajador,
  ) {
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "noreply@365equipo.com",
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
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

  async sendMailByUid(uid: string, mensaje: string, asunto: string) {
    const usuario = await this.authInstance.getUserByUid(uid);

    this.enviarEmail(usuario.email, mensaje, asunto);
  }

  async sendMailById(id: number, mensaje: string, asunto: string) {
    const usuario = await this.trabajadorInstance.getTrabajadorBySqlId(id);

    this.enviarEmail(usuario.emails, mensaje, asunto);
  }
}
