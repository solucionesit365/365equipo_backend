import { Type } from "class-transformer";
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { DateTime } from "luxon";

export class InspeccionFurgos {
  @IsString()
  nombreConductor: string;

  @IsString()
  matricula: string;

  @IsString()
  estadoUso: string;

  @IsString()
  // @Type(() => Date)
  fecha: string | DateTime;

  @ValidateNested({ each: true })
  @Type(() => PreguntasDaños)
  checklist: PreguntasDaños[];

  @IsOptional()
  @IsString()
  observaciones: string;
}

// export class FurgonetaDto {
//   @IsString()
//   matricula: string;
// }

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
