import { Type } from "class-transformer";
import { IsNumber } from "class-validator";

export class GetEquipoCoordinadoraPorTiendaDto {
  @Type(() => Number)
  @IsNumber()
  idTienda: number;
}
