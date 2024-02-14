import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export class TrabajadorDto {
  @IsNumber()
  id: number;

  @IsString()
  idApp: string;

  @IsString()
  nombreApellidos: string;

  @IsString()
  displayName: string;

  @IsString()
  emails: string;

  @IsString()
  dni: string;

  @IsString()
  direccion: string;

  @IsString()
  ciudad: string;

  @IsString()
  telefonos: string;

  @IsString()
  fechaNacimiento: string;

  @IsString()
  nacionalidad: string;

  @IsString()
  nSeguridadSocial: string;

  @IsString()
  codigoPostal: string;

  @IsString()
  cuentaCorriente: string;

  @IsString()
  tipoTrabajador: string;

  @IsString()
  inicioContrato: string;

  @IsString()
  finalContrato: string;

  @IsNumber()
  idResponsable: number;

  @IsNumber()
  idTienda: number;

  @IsBoolean()
  coordinadora: boolean;

  @IsBoolean()
  supervisora: boolean;

  @IsString()
  antiguedad: string;
}

export class TrabajadorFormRequest {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  emails: string;

  @IsNotEmpty()
  @IsString()
  telefonos: string;

  @IsNotEmpty()
  @IsString()
  nombreApellidos: string;

  @IsNotEmpty()
  @IsString()
  displayName: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  fechaNacimiento: Date;

  @IsNotEmpty()
  @IsString()
  dni: string;

  @IsOptional()
  @IsString()
  direccion: string;

  @IsOptional()
  @IsString()
  ciudad: string;

  @IsOptional()
  @IsString()
  codigoPostal: string;

  @IsOptional()
  @IsString()
  nacionalidad: string;

  @IsNotEmpty()
  @IsString()
  nSeguridadSocial: string;

  @IsNotEmpty()
  @IsString()
  cuentaCorriente: string;

  @IsNotEmpty()
  @IsArray()
  arrayPermisos: string[];

  @IsNotEmpty()
  @IsNumber()
  idResponsable: number | null;

  @IsNotEmpty()
  @IsNumber()
  idTienda: number | null;

  @IsNotEmpty()
  @IsBoolean()
  llevaEquipo: boolean;

  @IsString()
  tokenQR: string;
}

export class EditTrabajadorRequest {
  @ValidateNested()
  original: TrabajadorFormRequest;

  @ValidateNested()
  modificado: TrabajadorFormRequest;
}
