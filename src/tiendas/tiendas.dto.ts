import { IsNumber, IsString } from "class-validator";

export class TiendaDto {
  @IsNumber()
  id: number;

  @IsString()
  nombre: string;

  @IsString()
  direccion: string;
}

export interface Tienda {
  id: number;
  nombre: string;
  direccion: string;
  idExterno: number;
}
[];
