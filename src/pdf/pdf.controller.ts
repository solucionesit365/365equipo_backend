import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { PdfService } from "./pdf.service";
import { AuthGuard } from "../guards/auth.guard";
import {
  DeleteDocumentoDto,
  DownloadPdfByIdDto,
  GeneratePdfDto,
  GetDocumentosFirmadosDto,
  GetDocumentosOriginalesDto,
  SignDocumentDto,
} from "./pdf.dto";
import { StorageService } from "../storage/storage.service";
import { CryptoService } from "../crypto/crypto.class";
import { Response as ExpressResponse } from "express";
import { PrismaService } from "../prisma/prisma.service";
import { DateTime } from "luxon";
import { EmailService } from "../email/email.class";

@Controller("pdf")
export class PdfController {
  constructor(
    private readonly pdfService: PdfService,
    private readonly storageService: StorageService,
    private readonly cryptoService: CryptoService,
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  // Prueba real
  @UseGuards(AuthGuard)
  @Post("generar")
  async nuevoPdf(@Body() req: GeneratePdfDto) {
    const pdfBuffer = await this.pdfService.generatePdfFromHtml(req.content);
    const CSV = this.cryptoService.createCsv();
    const { hash, newFileBuffer } =
      await this.pdfService.addVerificationCodeToPdf(pdfBuffer, CSV);
    const relativePath = `api_firma/pdfs_originales/${CSV}.pdf`;
    const url = await this.storageService.uploadFile(
      relativePath,
      newFileBuffer,
      "application/pdf",
    );

    await this.pdfService.guardarDocumentoOriginalPdf(
      CSV,
      relativePath,
      url,
      req.department,
      hash,
      req.name,
    );
  }

  @UseGuards(AuthGuard)
  @Get("originales")
  async obtenerOriginales(@Query() req: GetDocumentosOriginalesDto) {
    return await this.pdfService.getDocumentosOriginales(req.department);
  }

  @UseGuards(AuthGuard)
  @Get("firmados")
  async obtenerFirmados(@Query() req: GetDocumentosFirmadosDto) {
    return await this.pdfService.getDocumentosFirmados(req.department);
  }

  @UseGuards(AuthGuard)
  @Post("delete")
  async DeleteDocumentoDto(@Body() req: DeleteDocumentoDto) {
    const nFirmados = await this.pdfService.getNDocumentosFirmados(req.id);

    if (nFirmados > 0) {
      return {
        error: true,
        message:
          "No es posible eliminar un documento original que ya tiene firmas",
      };
    } else {
      await this.pdfService.deleteDocumento(req.id);
      return {
        error: false,
      };
    }
  }

  @Get("documentoOriginal")
  async getDocument(
    @Query() req: DownloadPdfByIdDto,
    @Res() res: ExpressResponse,
  ) {
    try {
      const pdfStream = await this.pdfService.getStreamPdfById(req.id);

      // Configurar headers
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=documento.pdf",
        "Cache-Control": "no-cache",
        "Accept-Ranges": "bytes",
      });

      // Manejar errores del stream
      pdfStream.on("error", (error) => {
        console.error("Error en el stream:", error);
        if (!res.headersSent) {
          res.status(500).json({ message: "Error al transmitir el documento" });
        }
      });

      // Recolectar datos para verificar que no está vacío
      let hasData = false;
      pdfStream.on("data", () => {
        hasData = true;
      });

      // Verificar al final si recibimos datos
      pdfStream.on("end", () => {
        if (!hasData) {
          console.error("Stream terminó sin datos");
        }
      });

      // Pipe el stream a la respuesta
      pdfStream.pipe(res);

      // Manejar el cierre de la conexión
      res.on("close", () => {
        pdfStream.destroy();
      });
    } catch (error) {
      console.error("Error completo:", error);
      if (error instanceof NotFoundException) {
        res.status(404).json({ message: "Documento no encontrado" });
      } else {
        res.status(500).json({
          message: "Error interno al obtener el documento",
          error: error.message,
        });
      }
    }
  }

  @UseGuards(AuthGuard)
  @Post("sign")
  async signDocument(@Body() req: SignDocumentDto) {
    try {
      const signDatetime = DateTime.now();
      // Convertir la firma de base64 a buffer
      const base64Data = req.signature.split(";base64,").pop();
      if (!base64Data) {
        throw new BadRequestException("Formato de firma inválido");
      }

      const signatureBuffer = Buffer.from(base64Data, "base64");

      const originalPdfData =
        await this.prismaService.documentoOriginal.findFirst({
          where: {
            id: req.documentId,
          },
        });

      const originalPdfBuffer = await this.storageService.downloadFile(
        originalPdfData.relativePath,
      );

      const signedPdfBuffer = await this.pdfService.addSignatureToPdf(
        originalPdfBuffer,
        signatureBuffer,
        req.fullName,
        signDatetime,
      );

      const hashSignedPdf = this.cryptoService.hashFile512(signedPdfBuffer);
      const relativePath = `api_firma/pdfs_firmados/${hashSignedPdf}.pdf`;
      const url = await this.storageService.uploadFile(
        relativePath,
        signedPdfBuffer,
        "application/pdf",
      );

      await this.pdfService.guardarDocumentoFirmadoPdf(
        req.documentId,
        `api_firma/pdfs_firmados/${hashSignedPdf}.pdf`,
        url,
        hashSignedPdf,
        "Firmado por: " + req.fullName,
      );

      const templateData = {
        // Datos de la empresa
        logoUrl:
          "https://365obrador.com/wp-content/uploads/2022/06/logo-365.png", // Asegúrate de tener el logo en tus assets
        companyEmail: "info@365obrador.com",
        companyPhone: "+34 672 394 200",
        companyAddress: "Plaza Tetuán 3, Barcelona, 08010",

        // Datos del empleado y documento
        employeeName: req.fullName, // Reemplaza con el nombre real del empleado
        documentName: "Formación finalizada", // O el nombre del documento que corresponda
        signedDate: DateTime.now().setLocale("es").toLocaleString({
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),

        signedTime: DateTime.now().setLocale("es").toLocaleString({
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h24", // Formato 24 horas
        }),
      };

      await this.emailService.sendDocumentToEmail(
        signedPdfBuffer,
        req.email,
        "SignedDocumentation",
        templateData,
        "Aquí tiene su documentación firmada",
      );

      return true;
    } catch (error) {
      console.error("Error signing document:", error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        "Error al procesar la firma del documento",
      );
    }
  }
}
