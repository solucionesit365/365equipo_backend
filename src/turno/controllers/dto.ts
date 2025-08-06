import { Type } from "class-transformer";
import { IsNumber, IsString } from "class-validator";

export class GetTurnoSemanaTrabajadorDto {
  @Type(() => Number)
  @IsNumber()
  idTrabajador: number;

  @IsString()
  fecha: string;
}
