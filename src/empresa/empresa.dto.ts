import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateEmpresaDto {
  @IsString()
  nombre: string;

  @IsString()
  cif: string;

  @IsOptional()
  @IsNumber()
  idExterno: number;

  @IsOptional()
  @IsBoolean()
  autogestionada?: boolean;

  @IsOptional()
  @IsBoolean()
  existsBC?: boolean;
}

export class UpdateEmpresaDto {
  @IsString() // selection of the comapny to update
  id: string;

  @IsOptional()
  @IsNumber()
  idExterno: number;

  @IsOptional()
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  cif: string;

  @IsOptional()
  @IsBoolean()
  autogestionada?: boolean;

  @IsOptional()
  @IsBoolean()
  existsBC?: boolean;
}

export class DeleteEmpresaDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
