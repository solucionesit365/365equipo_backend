import { IsString, IsArray, IsNumber, IsOptional } from "class-validator";
import { IsStringOrDate } from "../validation/customValidators";
export class AnuncioDto {
  @IsArray()
  tiendas: number[];

  @IsStringOrDate()
  caducidad: string | Date;

  @IsString()
  categoria: string;

  @IsString()
  descripcion: string;

  @IsOptional()
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

  fechaCreacion: Date;

  constructor() {
    this.fechaCreacion = new Date();
  }
}



export class UpdateAnuncioDto {
  @IsString()
  _id: string;

  @IsStringOrDate()
  caducidad: string | Date;

  @IsString()
  categoria: string;

  @IsString()
  descripcion: string;

  @IsString()
  fotoPath: string;

  @IsString()
  titulo: string;
}
// export class OfertasAnuncios {
//   _id: string;
//   anuncioId: string;
//   nombrePostulante: string;
//   idsql: number;
//   comentario: string;
//   archivo: string;
//   puestoActual: string;

// }

// export class AddAnuncioDto {
//   @ValidateNested()
//   @Type(() => AnuncioDto)
//   anuncio: AnuncioDto;
// }
