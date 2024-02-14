import { Type } from "class-transformer";
import { IsArray, IsDate, IsNotEmpty } from "class-validator";

export class GetFichajesPendientesRequestDto {
  @IsNotEmpty()
  @IsArray()
  arrayIds: number[];

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  fecha: Date;
}
