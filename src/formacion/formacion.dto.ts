import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export class GetFormacionesDto {
  @IsEnum(["PRL", "Sanidad"])
  status: "PRL" | "Sanidad";
}

export class GetFormacionByIdDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
export class DeleteFormacionDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class TrabajadorSubDto {
  @IsOptional()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  nombreApellidos: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  telefono: string;
}

export class CompartirFormacionDto {
  @IsNotEmpty()
  @IsString()
  formacionId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => TrabajadorSubDto)
  trabajadores: TrabajadorSubDto[];
}

export class CompartirFormacionManualDto {
  @IsNotEmpty()
  @IsString()
  formacionId: string;

  @ValidateNested()
  @Type(() => TrabajadorSubDto)
  trabajador: TrabajadorSubDto;
}

enum Department {
  PRL = "PRL",
  Sanidad = "Sanidad",
}

enum PasoFormacionType {
  VIDEO_FORMATIVO = "VIDEO_FORMATIVO",
  PRESENTACION = "PRESENTACION",
  CUESTIONARIO = "CUESTIONARIO",
  DOCUMENTO_PARA_FIRMAR = "DOCUMENTO_PARA_FIRMAR",
}

class CreatePasosFormacionDto {
  @IsString()
  resourceId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(PasoFormacionType)
  @IsNotEmpty()
  type: PasoFormacionType;
}

export class CreateFormacionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(Department)
  @IsNotEmpty()
  department: Department;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePasosFormacionDto)
  pasos: CreatePasosFormacionDto[];

  @IsInt()
  @IsNotEmpty()
  nPasos: number;
}

class UpdatePasosFormacionDto {
  @IsString()
  resourceId: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(PasoFormacionType)
  @IsOptional()
  type?: PasoFormacionType;
}

export class UpdateFormacionDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(Department)
  @IsOptional()
  department?: Department;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePasosFormacionDto)
  @IsOptional()
  pasos?: UpdatePasosFormacionDto[];

  @IsInt()
  @IsOptional()
  nPasos?: number;
}
