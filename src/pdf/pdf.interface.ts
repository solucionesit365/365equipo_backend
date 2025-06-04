import { Readable } from "stream";
import { DateTime } from "luxon";
import { GeneratePdfDto, GetDocumentosOriginalesDto } from "./pdf.dto";

export abstract class IPdfService {
  abstract generatePdfFromHtml(htmlContent: string): Promise<Buffer>;

  abstract addSignatureToPdf(
    pdfBuffer: Buffer,
    signatureBuffer: Buffer,
    fullName: string,
    datetime: DateTime,
  ): Promise<Buffer>;

  abstract addVerificationCodeToPdf(
    fileBuffer: Buffer,
    CSV: string,
  ): Promise<{ newFileBuffer: Buffer; hash: string }>;

  abstract guardarDocumentoOriginalPdf(
    CSV: string,
    relativePath: string,
    url: string,
    department: GeneratePdfDto["department"],
    hash: string,
    name: string,
  ): Promise<void>;

  abstract guardarDocumentoFirmadoPdf(
    originalDocumentId: string,
    relativePath: string,
    url: string,
    hash: string,
    name: string,
  ): Promise<void>;

  abstract getDocumentosOriginales(
    department: GetDocumentosOriginalesDto["department"],
  ): Promise<any[]>;

  abstract getDocumentosFirmados(
    department: GetDocumentosOriginalesDto["department"],
  ): Promise<any[]>;

  abstract getDocumentoOriginal(id: string): Promise<any>;

  abstract getStreamPdfById(id: string): Promise<Readable>;

  abstract getNDocumentosFirmados(id: string): Promise<number>;

  abstract deleteDocumento(id: string): Promise<void>;
}
