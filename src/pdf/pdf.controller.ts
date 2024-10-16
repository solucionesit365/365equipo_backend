import { Controller, Get, Res } from "@nestjs/common";
import { PdfService } from "./pdf.service";
import { Response } from "express";
import * as fs from "fs";
import * as path from "path";

@Controller("pdf")
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get("generate")
  async generatePdf(@Res() res: Response) {
    const html = `
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        margin: 40px;
      }
      .signature-section {
        margin-top: 50px;
      }
      .signature-space {
        margin-top: 80px;
        border-top: 1px solid black;
        width: 300px;
        text-align: center;
      }
      .date-location {
        margin-top: 20px;
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <h1>Acuerdo de Términos</h1>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio.
      Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh 
      elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus 
      sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. 
      Class aptent taciti sociosqu ad litora torquent per conubia nostra, per 
      inceptos himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. 
      Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor.
    </p>

    <p>
      Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. 
      Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis 
      ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, 
      euismod in, nibh. Quisque volutpat condimentum velit. Class aptent taciti sociosqu ad 
      litora torquent per conubia nostra, per inceptos himenaeos. Nam nec ante. Sed lacinia, 
      urna non tincidunt mattis, tortor neque adipiscing diam, a cursus ipsum ante quis turpis. 
    </p>

    <div class="signature-section">
      <p class="date-location">
        Firmado a día <strong>{fecha}</strong> en <strong>{ubicación}</strong>.
      </p>
      <div class="signature-space">
        Firma
      </div>
    </div>
  </body>
</html>

    `;

    try {
      // Generar el PDF y obtener la ruta
      const pdfPath = await this.pdfService.generatePdfFromHtml(html);

      // Verificar si el archivo existe antes de enviarlo
      if (fs.existsSync(pdfPath)) {
        // Resolver la ruta absoluta del archivo
        const absolutePath = path.resolve(pdfPath);

        // Enviar el archivo PDF al cliente
        res.sendFile(absolutePath, (err) => {
          if (err) {
            console.error("Error al enviar el archivo:", err);
            res.status(500).send("Error al enviar el archivo.");
          } else {
            // Eliminar el archivo temporal después de enviarlo
            fs.unlinkSync(pdfPath);
          }
        });
      } else {
        // Si el archivo no existe, enviar un error
        res.status(404).send("Archivo PDF no encontrado.");
      }
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      res.status(500).send("Error al generar el PDF.");
    }
  }

  @Get("generate-and-sign")
  async generateAndSignPdf(@Res() res: Response) {
    const html = `
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        margin: 40px;
      }
      .signature-section {
        margin-top: 50px;
      }
      .signature-space {
        margin-top: 80px;
        border-top: 1px solid black;
        width: 300px;
        text-align: center;
      }
      .date-location {
        margin-top: 20px;
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <h1>Acuerdo de Términos</h1>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio.
      Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh 
      elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus 
      sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. 
      Class aptent taciti sociosqu ad litora torquent per conubia nostra, per 
      inceptos himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. 
      Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor.
    </p>

    <p>
      Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. 
      Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis 
      ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, 
      euismod in, nibh. Quisque volutpat condimentum velit. Class aptent taciti sociosqu ad 
      litora torquent per conubia nostra, per inceptos himenaeos. Nam nec ante. Sed lacinia, 
      urna non tincidunt mattis, tortor neque adipiscing diam, a cursus ipsum ante quis turpis. 
    </p>

    <div class="signature-section">
      <p class="date-location">
        Firmado a día <strong>{fecha}</strong> en <strong>{ubicación}</strong>.
      </p>
      <div class="signature-space">
        Firma
      </div>
    </div>
  </body>
</html>
    `;

    // Generar el PDF inicial
    const pdfPath = await this.pdfService.generatePdfFromHtml(html);

    // Ruta de la imagen de la firma
    const signaturePath = path.join(
      process.cwd(),
      "src",
      "pdf",
      "firmas-test",
      "firma.png",
    );

    // Añadir la firma al PDF
    const pdfWithSignaturePath = await this.pdfService.addSignatureToPdf(
      pdfPath,
      signaturePath,
    );

    // Enviar el PDF modificado con la firma
    res.sendFile(pdfWithSignaturePath);
  }

  @Get("test")
  async test() {
    return await this.pdfService.addVerificationCodeToPdf(
      "api_firma/sin_csv/fd457cb20662f65be9beb8b688a73ace5ec5f9705cc0043f693863d9a1b79bbf.pdf",
    );
  }
}
