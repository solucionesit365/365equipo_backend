import { Type } from "class-transformer";
import { IsNumber } from "class-validator";

export class GetEquipoCoordinadoraPorTiendaDto {
  @Type(() => Number)
  @IsNumber()
  idTienda: number;
}

export class CheckPINCoordinadoraDto {
  @IsNumber()
  idTienda: number;

  @IsNumber()
  pin: number;
}
