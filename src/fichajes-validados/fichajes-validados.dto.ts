import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

class TCuadranteMinDto {
  @Type(() => Date)
  @IsDate()
  inicio: Date;

  @Type(() => Date)
  @IsDate()
  final: Date;

  @IsString()
  nombre: string;

  @IsNumber()
  idTrabajador: number;

  @IsNumber()
  totalHoras: number;
}

class Fichaje {
  @Type(() => Date)
  @IsDate()
  entrada: Date;

  @Type(() => Date)
  @IsDate()
  salida: Date;
}

class IdFichajes {
  @IsString()
  entrada: string;

  @IsString()
  salida: string;
}

class Comentario {
  @IsString()
  entrada: string;

  @IsString()
  salida: string;
}

class HorasPagar {
  @IsNumber()
  total: number;

  @IsString()
  comentario: string;

  @IsString()
  respSuper: string;

  @IsString()
  estadoValidado: string;
}

export class FichajeValidadoDto {
  @IsOptional()
  @IsString()
  _id?: string;

  @IsNumber()
  idTrabajador: number;

  @IsNumber()
  idResponsable: number;

  @IsString()
  nombre: string;

  @IsString()
  dni: string;

  @ValidateNested()
  @Type(() => TCuadranteMinDto)
  cuadrante: TCuadranteMinDto;

  @ValidateNested()
  @Type(() => Fichaje)
  fichajes: Fichaje;

  @ValidateNested()
  @Type(() => IdFichajes)
  idFichajes: IdFichajes;

  @ValidateNested()
  @Type(() => Comentario)
  comentario: Comentario;

  @ValidateNested()
  @Type(() => HorasPagar)
  horasPagar: HorasPagar;

  @IsBoolean()
  aPagar: boolean;

  @IsBoolean()
  pagado: boolean;

  @IsNumber()
  horasExtra: number;

  @IsNumber()
  horasAprendiz: number;

  @IsNumber()
  horasCoordinacion: number;

  @IsNumber()
  horasCuadrante: number;

  @IsBoolean()
  enviado: boolean;
}
