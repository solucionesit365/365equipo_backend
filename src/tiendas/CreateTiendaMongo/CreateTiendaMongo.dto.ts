import { IsEnum, IsNumber, IsString } from "class-validator";

export class CreateTiendaMongoDto {
  @IsNumber()
  id: number;

  @IsNumber()
  idExterno: number;

  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNumber()
  municipalityCode: number;

  @IsString()
  phone: string;

  @IsString()
  postalCode: string;

  @IsString()
  province: string;

  @IsEnum(["Propia", "Franquicia"])
  type: "Propia" | "Franquicia";
}
