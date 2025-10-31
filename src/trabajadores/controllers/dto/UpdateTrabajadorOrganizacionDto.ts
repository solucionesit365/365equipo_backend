import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class UpdateTrabajadorOrganizacionDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  arrayRoles?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  arrayPermisos?: string[];

  @IsOptional()
  @IsNumber()
  idResponsable?: number;

  @IsOptional()
  @IsNumber()
  idTienda?: number;

  @IsOptional()
  @IsBoolean()
  llevaEquipo?: boolean;

  @IsOptional()
  @IsString()
  empresaId?: string;

  @IsOptional()
  @IsString()
  tipoTrabajador?: string;

  @IsOptional()
  @IsNumber()
  coordinatorId?: number;

  @IsOptional()
  @IsNumber()
  supervisorId?: number;
}
