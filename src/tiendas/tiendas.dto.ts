import { Type } from "class-transformer";
import { IsNumber, IsString } from "class-validator";

export class TiendaDto {
  @IsNumber()
  id: number;

  @IsString()
  nombre: string;

  @IsString()
  direccion: string;
}

export class GetTiendaByIdDto {
  @Type(() => Number)
  @IsNumber()
  id: number;
}

export interface Tienda {
  id: number;
  nombre: string;
  direccion: string;
  idExterno: number;
}
[];

export interface Tiendas2 {
  direccion: string;
  CodigoPostal: string;
  Poblacion: string;
  Provincia: string;
  CódMunicipio: number;
  nombre: string;
  Latitud: number;
  Longitud: number;
  Tipo: string;
  coordinatorId: number;
  id: number;
  idExterno: number;
  telefono: number;
  existsBC: boolean;
}
