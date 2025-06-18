import {
  IsNumber,
  IsString,
  ValidateNested,
  IsArray,
  IsBoolean,
  IsOptional,
} from "class-validator";
import { Type } from "class-transformer";

class TAmpliacionContrato {
  @IsOptional()
  @IsString()
  _id?: string;

  @IsString()
  fechaInicioAmpliacion: string;

  @IsOptional()
  @IsString()
  fechaFinAmpliacion?: string;

  @IsOptional()
  @IsString()
  fechaInicioReduccion?: string;

  @IsOptional()
  @IsString()
  fechaFinReduccion?: string;

  @IsString()
  jornadaActual: string | number;

  @IsString()
  nuevaJornada: string | number;

  @IsOptional()
  @IsString()
  jornadaActualReduccion?: string | number;

  @IsOptional()
  @IsString()
  nuevaJornadaReducida?: string | number;

  @IsOptional()
  @IsString()
  tipoReduccion?: string;

  @IsOptional()
  @IsString()
  tipoModificacion?: string;

  @IsOptional()
  @IsString()
  tipoAmpliacion?: string;

  @IsOptional()
  @IsString()
  motivo?: string;

  @IsOptional()
  @IsString()
  file?: string;

  @IsBoolean()
  ampliacion: boolean;

  @IsBoolean()
  vueltaJornada: boolean;

  @IsBoolean()
  firmaGuardado: boolean;

  @IsBoolean()
  escritoEnviado: boolean;

  @IsOptional()
  comentario?: {
    fechaRespuesta: Date;
    mensaje: string;
    nombre: string;
  }[];
}

export class TNotificarAmpliacionContratos {
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
  @Type(() => TAmpliacionContrato)
  ampliacionJornada: TAmpliacionContrato[];

  @IsString()
  fechaCreacion: string;

  @IsString()
  horaCreacion: string;
}
