import { Prisma, Turno } from "@prisma/client";
import { DateTime } from "luxon";

export abstract class ITurnoRepository {
  abstract createTurno(turno: Prisma.TurnoCreateInput): Promise<Turno>;
  abstract getTurnosPorTrabajador(
    idTrabajador: number,
    fecha: DateTime,
  ): Promise<Turno[]>;
  abstract getTurnosPorTienda(
    idTienda: number,
    fecha: DateTime,
  ): Promise<Turno[]>;

  abstract getTurnosPorEquipo(
    idResponsableEquipo: number,
    fecha: DateTime,
  ): Promise<Turno[]>;
  abstract deleteTurno(idTurno: string): Promise<Turno>;
}
