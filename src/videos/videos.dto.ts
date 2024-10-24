import { Type } from "class-transformer";
import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsNotEmpty,
} from "class-validator";

export class CreateVideoDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @Type(() => Number)
  @IsNumber()
  duration: number;

  @IsEnum(["PRL", "Sanidad"])
  category: "PRL" | "Sanidad";
}

export class DeleteVideoDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
