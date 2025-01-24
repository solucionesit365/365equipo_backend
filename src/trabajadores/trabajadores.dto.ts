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
import { ApiProperty } from "@nestjs/swagger";

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
  @ApiProperty({ description: "ID del trabajador", example: 1 })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({
    description: "Emails del trabajador",
    example: "test@example.com",
  })
  @IsNotEmpty()
  @IsString()
  emails: string;

  @ApiProperty({
    description: "Teléfonos del trabajador",
    example: "+34600111222",
  })
  @IsNotEmpty()
  @IsString()
  telefonos: string;

  @ApiProperty({
    description: "Nombre completo del trabajador",
    example: "Juan Pérez",
  })
  @IsNotEmpty()
  @IsString()
  nombreApellidos: string;

  @ApiProperty({ description: "Display name del trabajador", example: "Juan" })
  @IsNotEmpty()
  @IsString()
  displayName: string;

  @ApiProperty({
    description: "Fecha de nacimiento del trabajador en formato ISO",
    example: "1985-05-15",
  })
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === "string" && value.includes("/")) {
      return DateTime.fromFormat(value, "dd/MM/yyyy").toJSDate();
    }
    if (typeof value === "string") {
      return DateTime.fromISO(value).toJSDate();
    }
    return value;
  })
  @IsDate()
  fechaNacimiento: Date;

  @ApiProperty({ description: "DNI del trabajador", example: "12345678A" })
  @IsNotEmpty()
  @IsString()
  dni: string;

  @ApiProperty({
    description: "Dirección del trabajador",
    example: "Calle Falsa 123",
    required: false,
  })
  @IsOptional()
  @IsString()
  direccion: string;

  @ApiProperty({
    description: "Ciudad del trabajador",
    example: "Madrid",
    required: false,
  })
  @IsOptional()
  @IsString()
  ciudad: string;

  @ApiProperty({
    description: "Código postal del trabajador",
    example: "28001",
    required: false,
  })
  @IsOptional()
  @IsString()
  codigoPostal: string;

  @ApiProperty({
    description: "Nacionalidad del trabajador",
    example: "Española",
    required: false,
  })
  @IsOptional()
  @IsString()
  nacionalidad: string;

  @ApiProperty({
    description: "Número de la seguridad social del trabajador",
    example: "123456789",
  })
  @IsNotEmpty()
  @IsString()
  nSeguridadSocial: string;

  @ApiProperty({
    description: "Cuenta corriente del trabajador",
    example: "ES9121000418450200051332",
  })
  @IsNotEmpty()
  @IsString()
  cuentaCorriente: string;

  @ApiProperty({
    description: "Permisos asignados al trabajador",
    example: ["leer", "escribir"],
  })
  @IsNotEmpty()
  @IsArray()
  arrayPermisos: string[];

  @ApiProperty({
    description: "Roles asignados al trabajador",
    example: ["admin", "editor"],
  })
  @IsArray()
  arrayRoles: string[];

  @ApiProperty({
    description: "ID del responsable del trabajador",
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  idResponsable: number | null;

  @ApiProperty({
    description: "ID de la tienda del trabajador",
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  idTienda: number | null;

  @ApiProperty({
    description: "Indica si el trabajador lleva equipo",
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  llevaEquipo: boolean;

  @ApiProperty({
    description: "Token QR del trabajador",
    example: "abc123",
    required: false,
  })
  @IsOptional()
  @IsString()
  tokenQR: string;

  @ApiProperty({
    description: "ID de la empresa asociada al trabajador",
    example: "empresa123",
  })
  @IsNotEmpty()
  @IsString()
  empresaId: string | null;

  @ApiProperty({
    description: "Tipo de trabajador",
    example: "fijo",
    required: false,
  })
  @IsOptional()
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
