import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class NuevaFormacionDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  fecha: Date;

  @IsNotEmpty()
  @IsNumber()
  idTrabajador: number;

  @IsNotEmpty()
  @IsString()
  duracion: string;

  @IsNotEmpty()
  @IsString()
  lugar: string;
}

export class GetFormacionesTrabajadorDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  idTrabajador: number;
}
