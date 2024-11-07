import {
  IsEnum,
  IsString,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
class Option {
  @IsString()
  text: string;
}

export class CreateQuestionDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsNumber()
  correctAnswerOptionIndex: number;

  @IsOptional()
  @IsString({ each: true })
  correctFreeAnswer: string[];

  @IsEnum(["TEST", "INPUT"])
  type: "TEST" | "INPUT";

  @IsArray()
  @IsString({ each: true })
  categories: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Option)
  options: Option[];
}

export class UpdateQuestionDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsString()
  correctAnswerOptionId: string;

  @IsEnum(["TEST", "INPUT"])
  type: "TEST" | "INPUT";

  @IsArray()
  @IsString({ each: true })
  category: string[];
}

export class DeleteQuestionDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class GetQuestionDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class GetQuestionsDto {
  @IsString()
  categoryId: string;
}
