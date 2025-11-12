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
  address: string;
  postalCode: string;
  city: string;
  province: string;
  municipalityCode: number;
  name: string;
  latitude: number;
  longitude: number;
  type: string;
  coordinatorId: number;
  id: number;
  idExterno: number;
  phone: number;
  existsBC: boolean;
}
