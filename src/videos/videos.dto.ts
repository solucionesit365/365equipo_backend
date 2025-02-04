import { Type } from "class-transformer";
import { IsEnum, IsString, IsNumber, IsNotEmpty } from "class-validator";

export class CreateVideoDto {
  @IsString()
  name: string;

  @Type(() => Number)
  @IsNumber()
  duration: number;

  @IsEnum(["PRL", "Sanidad"])
  department: "PRL" | "Sanidad";
}

export class UpdateVideoDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @Type(() => Number)
  @IsNumber()
  duration: number;

  @IsEnum(["PRL", "Sanidad"])
  department: "PRL" | "Sanidad";
}

export class DeleteVideoDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class GetInfoVideoDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
