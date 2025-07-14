import { PlantillaTurno, Prisma } from "@prisma/client";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class GetPlantillasTurnosTienda {
  @Type(() => Number)
  @IsNumber()
  idTienda: number;
}

export class DeletePlantillaTurnos {
  @IsNotEmpty()
  @IsString()
  idPlantilla: string;
}

export class CreatePlantillasTurnosTienda {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  inicio: string;

  @IsNotEmpty()
  @IsString()
  final: string;

  @IsNumber()
  idTienda: number;

  @IsNumber()
  order: number;
}
