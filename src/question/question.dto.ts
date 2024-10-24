import { IsEnum, IsString, IsArray, IsNotEmpty } from "class-validator";

export class CreateQuestionDto {
  @IsString()
  title: string;

  @IsString()
  answer: string;

  @IsEnum(["TEST", "INPUT"])
  type: "TEST" | "INPUT";

  @IsArray()
  @IsString({ each: true })
  categories: string[];
}

export class UpdateQuestionDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsString()
  answer: string;

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
