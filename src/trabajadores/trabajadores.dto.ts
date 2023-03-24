import { IsBoolean, IsNumber, IsString } from "class-validator";

export class TrabajadorDto {
  @IsNumber()
  id: number;

  @IsString()
  idApp: string;

  @IsString()
  nombreApellidos: string;

  @IsString()
  displayName: string;

  @IsString()
  emails: string;

  @IsString()
  dni: string;

  @IsString()
  direccion: string;

  @IsString()
  ciudad: string;

  @IsString()
  telefonos: string;

  @IsString()
  fechaNacimiento: string;

  @IsString()
  nacionalidad: string;

  @IsString()
  nSeguridadSocial: string;

  @IsString()
  codigoPostal: string;

  @IsString()
  cuentaCorriente: string;

  @IsString()
  tipoTrabajador: string;

  @IsString()
  inicioContrato: string;

  @IsString()
  finalContrato: string;

  @IsNumber()
  idResponsable: number;

  @IsNumber()
  idTienda: number;

  @IsBoolean()
  coordinadora: boolean;

  @IsBoolean()
  supervisora: boolean;

  @IsString()
  antiguedad: string;
}
