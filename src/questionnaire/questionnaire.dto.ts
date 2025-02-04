import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateQuestionnaireDto {
  @IsString()
  name: string;

  @IsEnum(["Sanidad", "PRL"])
  department: "Sanidad" | "PRL";

  @IsEnum(["RANDOM", "SELECTION"])
  type: "RANDOM" | "SELECTION";

  @IsArray()
  @IsString({ each: true })
  questions: string[];

  @IsArray()
  @IsString({ each: true })
  categoryOfQuestions: string[];

  @IsNumber()
  maxErrors: number;

  @IsOptional()
  @IsNumber()
  nQuestions: number;
}

export class UpdateQuestionnaireDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsEnum(["Sanidad", "PRL"])
  department: "Sanidad" | "PRL";

  @IsEnum(["RANDOM", "SELECTION"])
  type: "RANDOM" | "SELECTION";

  @IsArray()
  @IsString({ each: true })
  questions: string[];

  @IsArray()
  @IsString({ each: true })
  categoryOfQuestions: string[];
}

export class GetQuestionnairesDto {
  @IsEnum(["Sanidad", "PRL"])
  department: "Sanidad" | "PRL";
}

export class GetQuestionnaireIdDto {
  @IsString()
  id: string;
}

export class DeleteQuestionnaireDto {
  @IsString()
  id: string;
}
