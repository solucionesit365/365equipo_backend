import { IsString, IsNotEmpty } from "class-validator";

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
