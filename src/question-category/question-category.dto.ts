import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export class CreateQuestionCategoryDto {
  @IsString()
  name: string;

  @IsEnum(["PRL", "Sanidad"])
  department: "PRL" | "Sanidad";
}

export class UpdateQuestionCategoryDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsEnum(["PRL", "Sanidad"])
  department: "PRL" | "Sanidad";
}

export class GetQuestionCategoryDto {
  @IsEnum(["PRL", "Sanidad"])
  department: "PRL" | "Sanidad";
}
