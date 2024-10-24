import { IsString, IsEnum, IsNotEmpty } from "class-validator";

export class CreatePresentationDto {
  @IsString()
  name: string;

  @IsString()
  embed: string;

  @IsEnum(["PRL", "Sanidad"])
  category: "PRL" | "Sanidad";
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
  category: "PRL" | "Sanidad";
}

export class TPresentation {
  id: string;
  name: string;
  embed: string;
  category: "PRL" | "Sanidad";
}
