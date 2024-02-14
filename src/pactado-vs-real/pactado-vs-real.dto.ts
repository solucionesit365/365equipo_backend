import { Type } from "class-transformer";
import { IsDate, IsNotEmpty } from "class-validator";

export class GetPactadoVsRealRequestDto {
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  fechaInicio: Date;
}
