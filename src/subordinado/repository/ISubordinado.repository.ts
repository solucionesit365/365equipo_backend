import { Tienda, Trabajador } from "@prisma/client";

export abstract class ISubordinadoRepository {
  abstract getSubordinados(
    idTrabajador: number,
  ): Promise<(Trabajador & { tienda: Tienda })[]>;
}
