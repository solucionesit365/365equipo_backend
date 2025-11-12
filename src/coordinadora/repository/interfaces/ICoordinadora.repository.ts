import { Trabajador } from "@prisma/client";

export abstract class ICoordinadoraRepository {
  abstract getCoordinadoraPorTienda(idTienda: number): Promise<{
    principal: Trabajador;
    adicionales: Trabajador[];
  }>;
  abstract getSubordinadosCoordinadora(
    idCoordinadora: number,
  ): Promise<Trabajador[]>;
}
