import { Trabajador } from "@prisma/client";

export abstract class ICoordinadoraRepository {
  abstract getCoordinadoraPorTienda(idTienda: number): Promise<Trabajador>;
  abstract getSubordinadosCoordinadora(
    idCoordinadora: number,
  ): Promise<Trabajador[]>;
}
