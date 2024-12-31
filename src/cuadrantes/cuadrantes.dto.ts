import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export enum TiposAusencia {
  BAJA = "BAJA",
  PERMISO_MATERNIDAD_PATERNIDAD = "PERMISO MATERNIDAD/PATERNIDAD",
  DIA_PERSONAL = "DIA_PERSONAL",
  VACACIONES = "VACACIONES",
  SANCION = "SANCIÓN",
  ABSENTISMO = "ABSENTISMO",
  HORAS_JUSTIFICADAS = "HORAS_JUSTIFICADAS",
}

class TAusenciaMinDto {
  @IsEnum(TiposAusencia)
  tipo: TiposAusencia;

  @IsOptional()
  @IsNumber()
  horas?: number;

  @IsBoolean()
  completa: boolean;

  // Aquí asumimos que idAusencia es un string; ajusta según sea necesario
  @IsString()
  idAusencia: string;
}

export class TCuadranteDto {
  @IsString() // Asume que ObjectId es un string
  _id: string;

  @IsNumber()
  idTrabajador: number;

  @IsString()
  idPlan: string;

  @IsNumber()
  idTienda: number;

  @IsDate()
  inicio: Date;

  @IsDate()
  final: Date;

  @IsString()
  nombre: string;

  @IsNumber()
  totalHoras: number;

  @IsBoolean()
  enviado: boolean;

  @IsString({ each: true })
  historialPlanes: string[];

  @IsNumber()
  horasContrato: number;

  @ValidateNested()
  @Type(() => TAusenciaMinDto)
  ausencia: TAusenciaMinDto;

  @IsNumber()
  bolsaHorasInicial: number;

  @IsOptional()
  @IsBoolean()
  borrable?: boolean;

  @IsOptional()
  @IsString()
  dni: string;
}

export class CopiarSemanaCuadranteDto {
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  fechaSemanaOrigen: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  fechaSemanaDestino: Date;

  @IsNotEmpty()
  @IsNumber()
  idTienda: number;
}

export class GetCuadrantesDto {
  @IsNotEmpty()
  @IsString()
  fecha: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  idTienda: number;
}
