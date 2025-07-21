import { Type } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export enum TiposAusencia {
  BAJA = "BAJA",
  PERMISO_MATERNIDAD_PATERNIDAD = "PERMISO MATERNIDAD/PATERNIDAD",
  DIA_PERSONAL = "DIA_PERSONAL",
  VACACIONES = "VACACIONES",
  SANCION = "SANCIÓN",
  ABSENTISMO = "ABSENTISMO",
  HORAS_JUSTIFICADAS = "HORAS_JUSTIFICADAS",
  REM = "REM",
}

export class CrearAusenciaDto {
  @IsNotEmpty()
  @IsNumber()
  idUsuario: number;

  @IsNotEmpty()
  @IsString()
  fechaInicio: string;

  @IsOptional()
  @IsString()
  fechaFinal: string;

  @IsOptional()
  @IsString()
  fechaRevision: string;

  @IsOptional()
  @IsString()
  comentario: string;

  @IsOptional()
  @IsBoolean()
  completa: boolean;

  @IsOptional()
  @IsNumber()
  horas: number;

  @IsOptional()
  @IsString()
  tienda: string;

  @IsString()
  nombre: string;

  @IsString()
  dni: string;

  @IsOptional()
  @IsNumber()
  horasContrato: number;

  @IsEnum(TiposAusencia)
  tipo: TiposAusencia;
}

export class GetAusenciasTrabajadorDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  idTrabajador: number;

  @IsNotEmpty()
  @IsString()
  fechaInicio: string;

  @IsNotEmpty()
  @IsString()
  fechaFinal: string;
}
