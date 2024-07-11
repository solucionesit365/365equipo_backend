import { IsString, IsNotEmpty, IsNumber } from "class-validator";

export interface Descanso {
  inicioDescanso: Date;
  finalDescanso: Date;
  tipo: "COMIDA" | "DESCANSO";
}

export class SalidaRequestDto {
  @IsNotEmpty()
  @IsString()
  idPar: string;
}

export class InicioDescansoRequestDto {
  @IsNotEmpty()
  @IsString()
  idPar: string;
}

export class FinalDescansoRequestDto {
  @IsNotEmpty()
  @IsString()
  idDescanso: string;
}

export class GetResumenDto {
  @IsNotEmpty()
  @IsNumber()
  idTienda: number;
}
