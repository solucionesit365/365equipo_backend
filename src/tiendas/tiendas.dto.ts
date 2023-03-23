import { IsNumber, IsString } from "class-validator";

export class TiendaDto {
  @IsNumber()
  id: number;

  @IsString()
  nombre: string;

  @IsString()
  direccion: string;
}
