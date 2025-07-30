import { Type } from "class-transformer";
import { IsNumber } from "class-validator";

export class GetAusenciasDto {
  @Type(() => Number)
  @IsNumber()
  year: number;
}
