import {
  IsNumber,
  IsString,
  ValidateNested,
  IsArray,
  IsBoolean,
  IsOptional,
} from "class-validator";
import { Type } from "class-transformer";

class THoraExtra {
  @IsOptional()
  @IsString()
  _id?: string;

  @IsNumber()
  tienda: number;

  @IsString()
  nombreTiendaSecundaria: string;

  @IsString()
  fecha: string;

  @IsString()
  horaInicio: string;

  @IsString()
  horaFinal: string;

  @IsBoolean()
  apagar: boolean;

  @IsBoolean()
  revision: boolean;
}

export class TNotificacionHorasExtras {
  @IsString()
  creador: string;

  @IsNumber()
  creadorIdsql: number;

  @IsString()
  trabajador: string;

  @IsString()
  dniTrabajador: string;

  @IsNumber()
  tiendaPrincipal: number;

  @IsString()
  nombreTiendaPrincipal: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => THoraExtra)
  horasExtras: THoraExtra[];

  @IsString()
  motivo: string;

  @IsString()
  formacion: string;

  @IsString()
  incrementoTrabajo: string;

  @IsString()
  fechaCreacion: string;

  @IsString()
  horaCreacion: string;
}
