import { Trabajador } from "@prisma/client";

export interface ICreateTrabajadorDto {
  nombreApellidos: string;
  displayName?: string;
  emails: string;
  dni: string;
  direccion?: string;
  ciudad?: string;
  telefonos?: string;
  fechaNacimiento?: Date;
  nacionalidad?: string;
  nSeguridadSocial?: string;
  codigoPostal?: string;
  tipoTrabajador: string;
  empresaId?: string;
  nPerceptor?: number;
  // Datos del contrato
  horasContrato: number;
  inicioContrato: Date;
  finalContrato?: Date;
  fechaAlta: Date;
  fechaAntiguedad: Date;
}

export abstract class ICreateTrabajadorUseCase {
  abstract execute(trabajadores: ICreateTrabajadorDto[]): Promise<Trabajador[]>;
}