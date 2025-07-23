import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { CreateContratoDto } from "../contrato/contrato.dto";
import { DateTime } from "luxon";

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

  @IsArray()
  arrayRoles: string[];
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
  @Transform(({ value }) => {
    // Si es string en formato dd/MM/yyyy
    if (typeof value === "string" && value.includes("/")) {
      return DateTime.fromFormat(value, "dd/MM/yyyy").toJSDate();
    }

    // Si es string en formato ISO
    if (typeof value === "string") {
      return DateTime.fromISO(value).toJSDate();
    }

    return value;
  })
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

  @IsArray()
  arrayRoles: string[];

  @IsOptional()
  @IsNumber()
  idResponsable: number | null;

  @IsOptional()
  @IsNumber()
  idTienda: number | null;

  @IsNotEmpty()
  @IsBoolean()
  llevaEquipo: boolean;

  @IsOptional()
  @IsString()
  tokenQR: string;

  @IsNotEmpty()
  @IsString()
  empresaId: string | null;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  tipoTrabajador: string | null;
}

export class EditTrabajadorRequest {
  @ValidateNested()
  original: TrabajadorFormRequest;

  @ValidateNested()
  modificado: TrabajadorFormRequest;
}

export class CreateTrabajadorRequestDto {
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateContratoDto)
  contrato: CreateContratoDto;

  @IsOptional()
  @IsString()
  displayFoto: string;

  @IsNotEmpty()
  @IsBoolean()
  excedencia: boolean;

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

  @IsOptional()
  @IsNumber()
  idResponsable: number | null;

  @IsOptional()
  @IsNumber()
  idTienda: number | null;

  @IsNotEmpty()
  @IsBoolean()
  llevaEquipo: boolean;

  @IsOptional()
  @IsString()
  tokenQR: string;

  @IsOptional()
  @IsString()
  idEmpresa: string;

  @IsOptional()
  @IsString()
  tipoTrabajador: string;
  arrayRoles: any;
}

export class GetSubordinadosDto {
  @IsNotEmpty()
  @IsString()
  uid: string;
}
export class GetSubordinadosByIdDto {
  @Type(() => Number)
  @IsNumber()
  idResponsable: number;
}

export class DeleteTrabajadorDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;
}

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  dni: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class GetTrabajadorBySqlIdDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class PermitirRegistroDto {
  @IsNotEmpty()
  @IsString()
  email: string;
}
