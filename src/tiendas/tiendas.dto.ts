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
  CodigoPostal: number;
  Poblacion: string;
  Provincia: string;
  CódMunicipio: number;
  nombre: string;
  Latitud: number;
  Longitud: number;
  Tipo: string;
  id: number;
  idExterno: number;
  telefono: number;
}
