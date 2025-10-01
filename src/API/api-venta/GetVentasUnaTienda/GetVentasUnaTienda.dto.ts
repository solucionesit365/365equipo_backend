import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class GetVentasUnaTiendaDto {
  @IsNotEmpty()
  @IsString()
  tienda: string;

  @IsOptional()
  @IsString()
  fechaInicioISO?: string;

  @IsOptional()
  @IsString()
  fechaFinalISO?: string;
}
