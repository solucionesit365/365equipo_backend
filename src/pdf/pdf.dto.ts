import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export class GeneratePdfDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsEnum(["PRL", "Sanidad"])
  department: "PRL" | "Sanidad";

  @IsNotEmpty()
  @IsString()
  name: string;
}

export class GetDocumentosOriginalesDto {
  @IsEnum(["PRL", "Sanidad"])
  department: "PRL" | "Sanidad";
}

export class GetDocumentosFirmadosDto {
  @IsEnum(["PRL", "Sanidad"])
  department: "PRL" | "Sanidad";
}

export class DeleteDocumentoDto {
  @IsString()
  id: string;
}

export class DownloadPdfByIdDto {
  @IsString()
  id: string;
}

export class SignDocumentDto {
  @IsNotEmpty()
  @IsString()
  documentId: string;

  @IsNotEmpty()
  @IsString()
  signature: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  phone: string;
}
