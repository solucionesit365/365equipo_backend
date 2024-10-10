import { Injectable } from "@nestjs/common";
import * as puppeteer from "puppeteer";
import * as fs from "fs";
import * as path from "path";
import { PDFDocument } from "pdf-lib";
import { CryptoService } from "../crypto/crypto.class";

@Injectable()
export class PdfService {
  constructor(private readonly cryptoService: CryptoService) {}

  async generatePdfFromHtml(htmlContent: string): Promise<string> {
    // Ruta donde se guardará temporalmente el PDF
    const outputDir = path.join(__dirname, "..", "generated");
    const outputPath = path.join(outputDir, "output.pdf");

    // Verificar si la carpeta "generated" existe, si no, crearla
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Inicializar Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Cargar el contenido HTML en la página
    await page.setContent(htmlContent, {
      waitUntil: "domcontentloaded",
    });

    // Generar el PDF
    await page.pdf({
      path: outputPath, // Guardar el PDF en la ruta especificada
      format: "A4",
      printBackground: true, // Incluir fondos en el PDF
    });

    // Cerrar el navegador
    await browser.close();

    // Retornar la ruta del archivo generado
    return outputPath;
  }

  async addSignatureToPdf(
    pdfPath: string,
    signaturePath: string,
  ): Promise<string> {
    // Leer el archivo PDF ya generado
    const pdfBytes = fs.readFileSync(pdfPath);
    // Crear un nuevo PDFDocument a partir del PDF existente
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Leer la imagen de la firma
    const signatureImageBytes = fs.readFileSync(signaturePath);
    const signatureImage = await pdfDoc.embedPng(signatureImageBytes);

    // Obtener la primera página del PDF
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Definir el tamaño y posición de la imagen de la firma (en el fondo de la página)
    const { width, height } = firstPage.getSize();
    const signatureWidth = 150; // Ancho de la firma
    const signatureHeight = 50; // Alto de la firma
    const xPosition = width - signatureWidth - 50; // Posición en el eje X
    const yPosition = 50; // Posición en el eje Y (cerca del borde inferior)

    // Dibujar la imagen de la firma en la primera página
    firstPage.drawImage(signatureImage, {
      x: xPosition,
      y: yPosition,
      width: signatureWidth,
      height: signatureHeight,
    });

    // Guardar el nuevo PDF modificado
    const modifiedPdfBytes = await pdfDoc.save();
    const outputPdfWithSignature = path.join(
      __dirname,
      "..",
      "generated",
      "output_with_signature.pdf",
    );
    fs.writeFileSync(outputPdfWithSignature, modifiedPdfBytes);

    return outputPdfWithSignature;
  }
}
