import { Type } from "class-transformer";
import { IsNumber } from "class-validator";

export class GetTiendasACargoDto {
  @Type(() => Number)
  @IsNumber()
  idSupervisor: number;
}
