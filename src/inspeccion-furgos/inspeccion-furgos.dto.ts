import { Type } from "class-transformer";
import {
  IsArray,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export class InspeccionFurgos {
  @IsString()
  nombreConductor: string;

  @IsString()
  matricula: string;

  @IsString()
  estadoUso: string;

  @IsDate()
  @Type(() => Date)
  fecha: Date;

  @ValidateNested({ each: true })
  @Type(() => PreguntasDaños)
  checklist: PreguntasDaños[];

  @IsOptional()
  @IsString()
  observaciones: string;
}

export class PreguntasDaños {
  @IsString()
  item: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  detail: string | null;

  @IsInt()
  photosCount: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photosUrls: string[];
}
