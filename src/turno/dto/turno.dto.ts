import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class GetTurnosEquipoCoordinadora {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  idTienda: number;

  @IsNotEmpty()
  @IsString()
  fecha: string;
}

export class GetSemanaIndividual {
  @IsNotEmpty()
  @Type(() => Number)
  idTrabajador: number;

  @IsNotEmpty()
  @IsString()
  fecha: string;
}

export class DeleteTurnoDto {
  @IsNotEmpty()
  @IsString()
  idTurno: string;
}
