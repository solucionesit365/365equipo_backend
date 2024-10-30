import { IsString, IsEnum, IsNotEmpty } from "class-validator";

export class CreatePresentationDto {
  @IsString()
  name: string;

  @IsString()
  embed: string;

  @IsEnum(["PRL", "Sanidad"])
  department: "PRL" | "Sanidad";
}

export class DeletePresentationDto {
  @IsString()
  id: string;
}

export class GetPresentationDto {
  @IsString()
  id: string;
}

export class UpdatePresentationDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  embed: string;

  @IsEnum(["PRL", "Sanidad"])
  department: "PRL" | "Sanidad";
}

export class TPresentation {
  id: string;
  name: string;
  embed: string;
  department: "PRL" | "Sanidad";
}
