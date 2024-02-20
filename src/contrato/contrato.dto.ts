import { Prisma } from "@prisma/client";
import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class CreateContratoDto implements Prisma.ContratoCreateInput {
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  fechaAlta: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  fechaAntiguedad: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fechaBaja?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  finalContrato?: Date;

  @IsNotEmpty()
  @IsNumber()
  horasContrato: number;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  inicioContrato: Date;
}
