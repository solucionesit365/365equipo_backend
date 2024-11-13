import { IsString } from "class-validator";

export class UploadFileDto {
  @IsString()
  contentType: string;
}

export class DownloadFileDto {
  @IsString()
  relativePath: string;
}
