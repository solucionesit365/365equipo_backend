import { Contrato2 } from "@prisma/client";

export interface ICreateContratoDto {
  horasContrato: number;
  inicioContrato: Date;
  finalContrato?: Date;
  fechaAlta: Date;
  fechaAntiguedad: Date;
  fechaBaja?: Date;
  idTrabajador: number;
}

export abstract class IContratoRepository {
  abstract create(data: ICreateContratoDto): Promise<Contrato2>;
  abstract findByTrabajadorId(idTrabajador: number): Promise<Contrato2[]>;
  abstract findActiveByTrabajadorId(idTrabajador: number): Promise<Contrato2 | null>;
  abstract update(id: string, data: Partial<ICreateContratoDto>): Promise<Contrato2>;
  abstract delete(id: string): Promise<void>;
}