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
      port: 465,
      secure: true,
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
    nombreArchivo?: string,
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
        let filename = "imagen.png";
        let contentType = "image/png";
        if (imagenBase64.startsWith("data:application/pdf")) {
          filename = nombreArchivo || "cv.pdf";
          contentType = "application/pdf";
        }
        mailOptions.attachments.push({
          filename,
          content: imagenBase64.split("base64,")[1],
          encoding: "base64",
          contentType,
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

  /**
   * Envía un correo electrónico con un código QR para visitas a fábrica
   * @param email Email del destinatario
   * @param visitorData Datos del visitante
   * @param qrCodeBase64 Código QR en formato base64
   * @param visitDate Fecha de la visita (opcional)
   * @returns Respuesta del envío del correo
   */
  async sendFactoryVisitEmail(
    email: string,
    visitorData: {
      nombre: string;
      apellido?: string;
      empresa?: string;
      motivo?: string;
    },
    qrCodeBase64: string,
  ) {
    const nombre = visitorData.nombre;
    const apellido = visitorData.apellido || "";
    const nombreCompleto = `${nombre} ${apellido}`.trim();
    const htmlContent = this.generarEmailVisitaTemplate(
      nombreCompleto,
      visitorData.empresa || "N/A",
    );

    const asunto = `Pase de visita - 365Obrador`;

    return await this.enviarEmail(email, htmlContent, asunto, qrCodeBase64);
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

  /**
   * Genera una plantilla HTML para emails de visita a fábrica con código QR
   */
  generarEmailVisitaTemplate(nombreVisitante: string, empresa: string): string {
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
              .email-title {
                  text-align: center;
                  font-size: 24px;
                  color: #1DA851;
                  margin: 20px 0;
                  font-weight: bold;
              }
              .email-content {
                  margin-top: 20px;
                  font-size: 16px;
                  line-height: 1.6;
                  color: #333333;
              }
              .visitor-info {
                  background-color: #f9f9f9;
                  padding: 15px;
                  margin-top: 20px;
                  border: 1px solid #dddddd;
                  border-radius: 5px;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              .info-row {
                  margin-bottom: 10px;
              }
              .info-row strong {
                  color: #555555;
              }
              .qr-container {
                  text-align: center;
                  margin: 30px 0;
              }
              .qr-code-img {
                  max-width: 200px;
              }
              .qr-instructions {
                  margin-top: 15px;
                  padding: 10px;
                  background-color: #e6f7ff;
                  border-left: 4px solid #1890ff;
                  border-radius: 4px;
              }
              .footer {
                  margin-top: 30px;
                  font-size: 14px;
                  color: #555555;
                  text-align: center;
                  border-top: 1px solid #eeeeee;
                  padding-top: 20px;
              }
              .footer p {
                  margin: 5px 0;
              }
              .button {
                  display: inline-block;
                  background-color: #1DA851;
                  color: white;
                  padding: 12px 24px;
                  text-align: center;
                  text-decoration: none;
                  font-size: 16px;
                  border-radius: 5px;
                  margin-top: 20px;
              }
              .button:hover {
                  background-color: #179245;
              }
          </style>
      </head>
      <body>
          <div class="email-container">
              <div class="email-header">
                  <img src="https://365equipo.com/logo365Email.png" alt="365 Obrador Logo">
              </div>
              <div class="email-title">
                  Confirmación de Visita a Fábrica
              </div>
              <div class="email-content">
                  <p>Estimado/a <strong>${nombreVisitante}</strong>,</p>
                  <p>Su visita a nuestras instalaciones ha sido confirmada. A continuación encontrará un código QR que deberá mostrar al llegar a nuestra fábrica.</p>
                  
                  <div class="visitor-info">
                      <div class="info-row">
                          <strong>Visitante:</strong> ${nombreVisitante}
                      </div>
                      <div class="info-row">
                          <strong>Empresa:</strong> ${empresa}
                      </div>
                  </div>
                  
                  <div class="qr-container">
                      <p><strong>Código QR de acceso</strong></p>
                      <img src="cid:123456" alt="Código QR de acceso" class="qr-code-img">
                  </div>
                  
                  <div class="qr-instructions">
                      <p><strong>Instrucciones:</strong></p>
                      <p>1. Guarde este email o descargue el código QR.</p>
                      <p>2. Muestre este código QR al personal de seguridad al llegar a nuestras instalaciones.</p>
                  </div>
              </div>
              
              <div class="footer">
                  <p>Si tiene cualquier duda sobre su visita, no dude en contactarnos.</p>
                  <a href="tel:34722495410" class="button">Llamar: +34 722 49 54 10</a>
                  <p>© 365Obrador - Todos los derechos reservados</p>
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

  generarEmailTemplateRevisionMedica(
    nombreTrabajador: string,
    telefono: string,
    fechaPreferida: string,
  ): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f6f9;
                margin: 0;
                padding: 0;
            }
            .email-container {
                max-width: 650px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 25px;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                border-top: 6px solid #0d6efd;
            }
            .email-header {
                text-align: center;
                margin-bottom: 20px;
            }
            .email-header img {
                max-width: 180px;
            }
            .title {
                text-align: center;
                font-size: 22px;
                font-weight: bold;
                color: #0d6efd;
                margin: 15px 0 25px 0;
            }
            .email-content {
                font-size: 16px;
                line-height: 1.6;
                color: #333333;
            }
            .info-card {
                background-color: #f9fbfd;
                padding: 18px;
                margin-top: 20px;
                border: 1px solid #e3eaf3;
                border-radius: 8px;
            }
            .info-row {
                margin-bottom: 12px;
            }
            .info-row strong {
                color: #0d6efd;
            }
            .footer {
                margin-top: 30px;
                font-size: 13px;
                color: #555555;
                text-align: center;
                border-top: 1px solid #eeeeee;
                padding-top: 15px;
            }
            .footer p {
                margin: 5px 0;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <img src="https://365equipo.com/logo365Email.png" alt="365 Obrador Logo">
            </div>
            <div class="title">Solicitud de Revisión Médica</div>
            <div class="email-content">
                <p>El trabajador <strong>${nombreTrabajador}</strong> ha solicitado una revisión médica.</p>
                <div class="info-card">
                    <div class="info-row">
                        <strong>📞 Teléfono de contacto:</strong> ${telefono}
                    </div>
                    <div class="info-row">
                        <strong>📅 Fecha preferida:</strong> ${fechaPreferida}
                    </div>
                </div>
                <p style="margin-top:20px;">
                    Por favor, gestionen esta solicitud conforme al protocolo de la campaña de revisiones médicas.
                </p>
            </div>
            <div class="footer">
                <p>Este correo ha sido generado automáticamente por el sistema de 365 Obrador.</p>
                <p>Si tiene alguna duda, contacte con el departamento de Prevención</p>
            </div>
        </div>
    </body>
    </html>
  `;
  }

  generarEmailTemplateInspeccionDanada(
    matriculaFurgoneta: string,
    nombreConductor: string,
    checklist: { status: string; item: string; detail: string }[],
    observaciones?: string,
  ): string {
    const detailsItems = checklist
      .filter((item) => item.status === "DAÑOS")
      .map((item) => `<li><strong>${item.item}:</strong> ${item.detail}</li>`)
      .join("");

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f6f9;
                margin: 0;
                padding: 0;
            }
            .email-container {
                max-width: 650px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 25px;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                border-top: 6px solid #e66c5a;
            }
            .email-header {
                text-align: center;
                margin-bottom: 20px;
            }
            .email-header img {
                max-width: 180px;
            }
            .title {
                text-align: center;
                font-size: 22px;
                font-weight: bold;
                color: #e66c5a;
                margin: 15px 0 25px 0;
            }
            .email-content {
                font-size: 16px;
                line-height: 1.6;
                color: #333333;
            }
            .info-card {
                background-color: #f9fbfd;
                padding: 18px;
                margin-top: 20px;
                border: 1px solid #e3eaf3;
                border-radius: 8px;
            }
            .info-row {
                margin-bottom: 12px;
            }
            .info-row strong {
                color: #e66c5a;
            }
            .footer {
                margin-top: 30px;
                font-size: 13px;
                color: #555555;
                text-align: center;
                border-top: 1px solid #eeeeee;
                padding-top: 15px;
            }
            .footer p {
                margin: 5px 0;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="title">Nueva Inspección con Daños Registrada</div>
            <div class="email-content">
                <p>Se ha registrado una nueva inspección con <strong>DAÑOS</strong> para la furgoneta <strong>${matriculaFurgoneta}</strong> por el conductor <strong>${nombreConductor}</strong>.</p>
                <div class="info-card">
                    <div class="info-row">
                        <strong>🛠️ Daños detectados:</strong> 
                          <ul>
                          ${detailsItems}
                          </ul>
                    </div>
                    ${observaciones ? `<div class="info-row"><strong>📝 Observaciones:</strong> ${observaciones}</div>` : ""}
                </div>
                <p style="margin-top:20px;">
                    Por favor, revisen esta inspección y tomen las medidas necesarias conforme al protocolo de gestión de daños.
                </p>
            </div>
            <div class="footer">
                <p>Este correo ha sido generado automáticamente por el sistema de 365 Obrador.</p>
                <p>Si tiene alguna duda, contacte con el departamento de Mantenimiento o Gestión de Flotas.</p>
            </div>
        </div>
    </body>
    </html>
  `;
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
