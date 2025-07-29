import { Contrato2 } from "@prisma/client";

export interface ICreateContratoUseCaseDto {
  horasContrato: number;
  inicioContrato: Date;
  finalContrato?: Date;
  fechaAlta: Date;
  fechaAntiguedad: Date;
  fechaBaja?: Date;
  idTrabajador: number;
}

export abstract class ICreateContratoUseCase {
  abstract execute(contrato: ICreateContratoUseCaseDto): Promise<Contrato2>;
}