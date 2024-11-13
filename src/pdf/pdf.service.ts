import { Injectable, InternalServerErrorException } from "@nestjs/common";
import * as puppeteer from "puppeteer";
import * as fs from "fs";
import * as path from "path";
import { PDFDocument, degrees, rgb } from "pdf-lib";
import { StorageService } from "../storage/storage.service";
import { CryptoService } from "../crypto/crypto.class";
import { GeneratePdfDto, GetDocumentosOriginalesDto } from "./pdf.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PdfService {
  constructor(
    private readonly storageService: StorageService,
    private readonly cryptoService: CryptoService,
    private readonly prismaService: PrismaService,
  ) {}

  async generatePdfFromHtml(htmlContent: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
    });

    try {
      const page = await browser.newPage();

      // Añadir los estilos de Quill al HTML
      const htmlWithStyles = `
        <html>
          <head>
            <style>
              /* Estilos básicos de Quill */
              .ql-align-center {
                text-align: center;
              }
              .ql-align-right {
                text-align: right;
              }
              .ql-align-justify {
                text-align: justify;
              }
              /* Estilos adicionales */
              body {
                font-family: Arial, sans-serif;
                line-height: 1.5;
                padding: 20px;
              }
              p {
                margin: 0 0 1em 0;
              }
              strong {
                font-weight: bold;
              }
              em {
                font-style: italic;
              }
              h1 {
                font-size: 2em;
                margin: 0.67em 0;
              }
              h2 {
                font-size: 1.5em;
                margin: 0.75em 0;
              }
              ul, ol {
                padding-left: 2em;
                margin: 1em 0;
              }
              .ql-indent-1 {
                padding-left: 3em;
              }
              .ql-indent-2 {
                padding-left: 6em;
              }
              /* Ajustes para listas */
              .ql-bullet {
                list-style-type: disc;
              }
              .ql-ordered {
                list-style-type: decimal;
              }
              /* Ajustes para imágenes */
              img {
                max-width: 100%;
                height: auto;
              }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `;

      await page.setContent(htmlWithStyles, {
        waitUntil: "domcontentloaded",
      });

      // Generar el PDF como Uint8Array
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20mm",
          right: "20mm",
          bottom: "20mm",
          left: "20mm",
        },
        // Opciones adicionales para mejorar la calidad
        preferCSSPageSize: true,
        displayHeaderFooter: false,
        scale: 1,
      });

      // Convertir Uint8Array a Buffer
      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error("Error generando PDF:", error);
      throw error;
    } finally {
      await browser.close();
    }
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

  private changeFolderFilePath(filePath: string) {
    return filePath.replace("sin_csv", "con_csv");
  }

  private cleanFileName(filePath: string) {
    const parts = filePath.split("/");
    const fileName = parts[parts.length - 1];
    return fileName.replace(".pdf", "");
  }

  // async addVerificationCodeToPdf(
  //   pathFile: string,
  // ): Promise<{ pathFile: string; hash: string }> {
  //   // Descargar el archivo PDF del bucket
  //   const fileBuffer = await this.storageService.downloadFile(pathFile);

  //   // Verificar si el archivo tiene un encabezado de PDF válido
  //   const header = fileBuffer.subarray(0, 5).toString();
  //   if (header !== "%PDF-") {
  //     throw new Error("El archivo descargado no es un archivo PDF válido.");
  //   }

  //   // Cargar el PDF descargado usando pdf-lib
  //   const pdfDoc = await PDFDocument.load(fileBuffer);

  //   // Obtener todas las páginas del documento
  //   const pages = pdfDoc.getPages();

  //   // Agregar el código en cada página del documento
  //   for (const page of pages) {
  //     const { width } = page.getSize();
  //     const fontSize = 8;
  //     const text =
  //       "Código seguro de verificación: " + this.cleanFileName(pathFile);

  //     page.drawText(text, {
  //       x: 20, // Un poco de margen desde el borde izquierdo
  //       y: 10, // Cerca del borde inferior
  //       size: fontSize,
  //       rotate: degrees(0), // Sin rotación
  //       color: rgb(0.5, 0.5, 0.5), // Color gris para que sea menos intrusivo
  //       maxWidth: width - 40, // Máximo ancho para evitar desbordamiento
  //     });
  //   }

  //   // Guardar el PDF modificado
  //   const modifiedPdfBuffer = await pdfDoc.save();

  //   // Generar el hash del archivo modificado
  //   const hash = this.cryptoService.hashFile512(Buffer.from(modifiedPdfBuffer));

  //   // Subir el archivo modificado al bucket
  //   return {
  //     pathFile: await this.storageService.uploadFile(
  //       this.changeFolderFilePath(pathFile),
  //       Buffer.from(modifiedPdfBuffer),
  //       "application/pdf",
  //     ),
  //     hash: hash,
  //   };
  // }

  async addVerificationCodeToPdf(
    fileBuffer: Buffer,
    CSV: string,
  ): Promise<{ newFileBuffer: Buffer; hash: string }> {
    // Cargar el PDF descargado usando pdf-lib
    const pdfDoc = await PDFDocument.load(fileBuffer);

    // Obtener todas las páginas del documento
    const pages = pdfDoc.getPages();

    // Agregar el código en cada página del documento
    for (const page of pages) {
      const { width } = page.getSize();
      const fontSize = 8;
      const text = "Código seguro de verificación: " + CSV;

      page.drawText(text, {
        x: 20, // Un poco de margen desde el borde izquierdo
        y: 10, // Cerca del borde inferior
        size: fontSize,
        rotate: degrees(0), // Sin rotación
        color: rgb(0.5, 0.5, 0.5), // Color gris para que sea menos intrusivo
        maxWidth: width - 40, // Máximo ancho para evitar desbordamiento
      });
    }

    // Guardar el PDF modificado
    const modifiedPdfBuffer = await pdfDoc.save();
    const newFileBuffer = Buffer.from(modifiedPdfBuffer);

    // Generar el hash del archivo modificado
    const hash = this.cryptoService.hashFile512(newFileBuffer);

    // Subir el archivo modificado al bucket
    return {
      newFileBuffer,
      hash: hash,
    };
  }

  async guardarDocumentoPdf(
    CSV: string,
    relativePath: string,
    url: string,
    department: GeneratePdfDto["department"],
    hash: string,
    name: string,
  ) {
    try {
      await this.prismaService.documentoOriginal.create({
        data: {
          id: CSV,
          department,
          name,
          hash,
          pathFile: url,
          relativePath,
        },
      });
    } catch (error) {
      console.error("Error guardando documento PDF:", error);
      throw new InternalServerErrorException("Error guardando documento PDF.");
    }
  }

  async getDocumentosOriginales(
    department: GetDocumentosOriginalesDto["department"],
  ) {
    try {
      return await this.prismaService.documentoOriginal.findMany({
        where: {
          department,
        },
      });
    } catch (error) {
      console.error("Error obteniendo documentos originales:", error);
      throw new InternalServerErrorException(
        "Error obteniendo documentos originales.",
      );
    }
  }

  async getDocumentosFirmados(
    department: GetDocumentosOriginalesDto["department"],
  ) {
    try {
      return await this.prismaService.documentoFirmado.findMany({
        where: {
          department,
        },
      });
    } catch (error) {
      console.error("Error obteniendo documentos originales:", error);
      throw new InternalServerErrorException(
        "Error obteniendo documentos originales.",
      );
    }
  }

  async getDocumentoOriginal(id: string) {
    try {
      return await this.prismaService.documentoOriginal.findUnique({
        where: {
          id,
        },
      });
    } catch (error) {
      console.error("Error obteniendo documento original:", error);
      throw new InternalServerErrorException(
        "Error obteniendo documento original.",
      );
    }
  }

  // Del original
  async getNDocumentosFirmados(id: string) {
    try {
      const documentoOriginal =
        await this.prismaService.documentoOriginal.findUnique({
          where: {
            id,
          },
          include: {
            firmados: true,
          },
        });

      if (!documentoOriginal) {
        throw new Error("Documento original no encontrado.");
      }

      return documentoOriginal.firmados.length;
    } catch (error) {
      console.error("Error obteniendo documentos originales:", error);
      throw new InternalServerErrorException(
        "Error obteniendo documentos originales.",
      );
    }
  }

  async deleteDocumento(id: string) {
    try {
      const documentoOriginal = await this.getDocumentoOriginal(id);

      if (!documentoOriginal) {
        throw new Error("Documento original no encontrado.");
      }

      await this.storageService.deleteFile(documentoOriginal.relativePath);

      await this.prismaService.documentoOriginal.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      console.error("Error eliminando documento:", error);
      throw new InternalServerErrorException("Error eliminando documento.");
    }
  }
}
