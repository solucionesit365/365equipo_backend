import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateTiendaMongoDto {
  @IsString()
  _id: string;

  @IsOptional()
  @IsNumber()
  id: number;

  @IsOptional()
  @IsNumber()
  idExterno: number;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsNumber()
  latitude: number;

  @IsOptional()
  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsNumber()
  municipalityCode: number;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  postalCode: string;

  @IsOptional()
  @IsString()
  province: string;

  @IsOptional()
  @IsEnum(["Propia", "Franquicia"])
  type: "Propia" | "Franquicia";
}
