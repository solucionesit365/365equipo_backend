import { Type } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

export class GetTrabajadoresDto {
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  sonPersonas?: boolean | undefined;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  sonTiendas?: boolean | undefined;
}
