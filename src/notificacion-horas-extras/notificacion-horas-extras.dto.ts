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

  @IsString()
  motivo: string;

  @IsString()
  formacion: string;

  @IsString()
  incrementoTrabajo: string;

  @IsBoolean()
  apagar: boolean;

  @IsBoolean()
  revision: boolean;

  @IsString()
  comentario?: {
    fechaRespuesta: Date;
    mensaje: string;
    nombre: string;
  }[];
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
  fechaCreacion: string;

  @IsString()
  horaCreacion: string;
}
