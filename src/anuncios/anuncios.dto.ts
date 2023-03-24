import {
  IsString,
  IsArray,
  IsNumber,
  IsOptional,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class AnuncioDto {
  @IsArray()
  tiendas: number[];

  @IsString()
  caducidad: string;

  @IsString()
  categoria: string;

  @IsString()
  descripcion: string;

  @IsString()
  fotoPath: string;

  @IsString()
  tipoArchivo: string;

  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  urlVideo: string;

  @IsNumber()
  visto: number;
}

export class AddAnuncioDto {
  @ValidateNested()
  @Type(() => AnuncioDto)
  anuncio: AnuncioDto;
}
