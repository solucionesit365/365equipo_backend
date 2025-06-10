import { IsEmail, IsNumber, IsOptional, IsString } from "class-validator";

export class FormularioContacto {
  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  telefono: string;

  @IsString()
  mensaje: string;
  @IsOptional()
  @IsNumber()
  idExterno: number;
}
