import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateCompanyDto {
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

export class UpdateCompanyDto {
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

export class DeleteCompanyDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
