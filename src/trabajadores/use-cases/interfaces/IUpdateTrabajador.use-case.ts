import { Trabajador } from "@prisma/client";

export interface IUpdateTrabajadorDto {
  id: number;
  nombreApellidos?: string;
  displayName?: string;
  emails?: string;
  dni?: string;
  direccion?: string;
  ciudad?: string;
  telefonos?: string;
  fechaNacimiento?: Date;
  nacionalidad?: string;
  nSeguridadSocial?: string;
  codigoPostal?: string;
}

export abstract class IUpdateTrabajadorUseCase {
  abstract execute(trabajadores: IUpdateTrabajadorDto[]): Promise<Trabajador[]>;
  abstract executeOne(trabajador: IUpdateTrabajadorDto): Promise<Trabajador>;
}