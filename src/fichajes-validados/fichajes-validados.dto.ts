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
  @IsOptional()
  @IsString()
  entrada: string;

  @IsOptional()
  @IsString()
  salida: string;
}

class HorasPagar {
  @IsNumber()
  total: number;

  @IsOptional()
  @IsString()
  comentario: string;

  @IsOptional()
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

  @IsNumber()
  horasFichaje: number;

  @IsNumber()
  idTienda: number;

  @IsString()
  dni: string;

  @ValidateNested()
  @Type(() => TCuadranteMinDto)
  cuadrante: TCuadranteMinDto;

  // @ValidateNested()
  // @Type(() => Fichaje)
  // fichajes: Fichaje;

  @Type(() => Date)
  @IsDate()
  fichajeEntrada: Date;

  @Type(() => Date)
  @IsDate()
  fichajeSalida: Date;

  @ValidateNested()
  @Type(() => IdFichajes)
  idFichajes: IdFichajes;

  @IsOptional()
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
