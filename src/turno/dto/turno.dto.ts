import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from "class-validator";
import { IsDifferentThan } from "../../validation/customValidators";

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

export class ObjetoTurnoDto {
  @IsString()
  id: string;

  @IsString()
  inicioISO: string;

  @IsString()
  @IsDifferentThan("inicioISO", {
    message: "El horario de inicio y final del turno no pueden ser iguales",
  })
  finalISO: string;

  @IsNumber()
  tiendaId: number;

  @IsBoolean()
  borrable: boolean;
}

export class SaveTurnosTrabajadorSemanalDto {
  @IsNumber()
  idTrabajador: number;

  @IsString()
  inicioSemanaISO: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ObjetoTurnoDto)
  arrayTurnos: ObjetoTurnoDto[];
}

export class CopiarTurnosPorSemanaDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  idTienda: number;

  @IsNotEmpty()
  @IsString()
  diaSemanaOrigen: string;

  @IsNotEmpty()
  @IsString()
  diaSemanaDestino: string;
}
