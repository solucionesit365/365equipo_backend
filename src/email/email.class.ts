import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { FirebaseService } from "../firebase/firebase.service";
import { join } from "path";
import * as hbs from "handlebars";
import * as fs from "fs/promises";

@Injectable()
export class EmailService {
  private transporter: any;
  private readonly templateDir: string;

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

    this.templateDir = join(process.cwd(), "src", "email", "template");
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

      const response = await this.transporter.sendMail(mailOptions);
      return response;
    } else {
      throw Error("Faltan datos en enviarEmail");
    }
  }

  async sendMailByUid(uid: string, mensaje: string, asunto: string) {
    const usuario = await this.authInstance.getUserByUid(uid);

    this.enviarEmail(usuario.email, mensaje, asunto);
  }

  generarEmailTemplate(nombreTrabajador: string, mensaje: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
              }
              .email-container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              }
              .email-header {
                  text-align: center;
              }
              .email-header img {
                  max-width: 180px;
              }
              .email-content {
                  margin-top: 20px;
                  font-size: 16px;
                  line-height: 1.6;
                  color: #333333;
              }
              .card {
                  background-color: #f9f9f9;
                  padding: 15px;
                  margin-top: 10px;
                  border: 1px solid #dddddd;
                  border-radius: 5px;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              .card strong {
                  display: block;
                  font-size: 18px;
                  color: #333333;
                  margin-bottom: 5px;
              }
              .footer {
                  margin-top: 30px;
                  font-size: 14px;
                  color: #555555;
              }
              .footer p {
                  margin: 5px 0;
              }
              .whatsapp-button {
                  display: inline-block;
                  background-color: #25D366;
                  color: white;
                  padding: 12px 24px;
                  text-align: center;
                  text-decoration: none;
                  font-size: 16px;
                  border-radius: 5px;
                  margin-top: 20px;
              }
              .whatsapp-button:hover {
                  background-color: #1DA851;
              }
          </style>
      </head>
      <body>
          <div class="email-container">
              <div class="email-header">
                  <img src="https://365equipo.com/logo365Email.png" alt="365 Obrador Logo">
              </div>
              <div class="email-content">
                  <p>${mensaje}</p>
                  <div class="card">
                      <strong>${nombreTrabajador}</strong>
                  </div>
              </div>
              <div class="footer">
                  <p>Cualquier duda póngase en contacto vía WhatsApp al teléfono móvil de la firma.</p>
                  <a href="https://wa.me/34722495410" class="whatsapp-button">Contactar por WhatsApp</a>
                  <p>Equipo de informática 365Obrador</p>
                  <p>+34 722 49 54 10</p>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  private async compileTemplate(
    templateName: string,
    data: any,
  ): Promise<string> {
    try {
      // Construir la ruta completa al template
      const templatePath = join(this.templateDir, `${templateName}.html`);

      // Verificar si el archivo existe
      try {
        await fs.access(templatePath);
      } catch (error) {
        console.error("Template no encontrado:", error);
        throw new Error(`Template no encontrado en: ${templatePath}`);
      }

      // Leer el contenido del template
      const templateContent = await fs.readFile(templatePath, "utf-8");

      // Compilar el template
      const template = hbs.compile(templateContent);
      const result = template(data);

      return result;
    } catch (error) {
      console.error("Error en compileTemplate:", error);
      throw new Error(`Error compilando template: ${error.message}`);
    }
  }

  async sendDocumentToEmail(
    pdfBuffer: Buffer,
    toEmail: string,
    template: string,
    templateData: any = {},
    subject = "Documento adjunto",
  ): Promise<void> {
    try {
      const htmlContent = await this.compileTemplate(template, templateData);

      const mailOptions = {
        from: "noreply@365equipo.com",
        to: toEmail,
        subject: subject,
        html: htmlContent,
        attachments: [
          {
            filename: "documento_firmado.pdf",
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error en sendDocumentToEmail:", error);
      throw new Error(`Error enviando email: ${error.message}`);
    }
  }
}
