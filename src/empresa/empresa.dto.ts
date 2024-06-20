import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateEmpresaDto {
  @IsString()
  nombre: string;

  @IsString()
  cif: string;

  @IsOptional()
  @IsNumber()
  idExterno: number;
}

export class UpdateEmpresaDto {
  @IsString()
  id: string;

  @IsString()
  nombre: string;

  @IsString()
  cif: string;

  @IsOptional()
  @IsNumber()
  idExterno: number;
}

export class DeleteEmpresaDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
