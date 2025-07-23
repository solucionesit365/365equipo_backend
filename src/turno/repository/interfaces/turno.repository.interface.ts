import { Prisma, Turno } from "@prisma/client";
import { DateTime } from "luxon";

export abstract class ITurnoRepository {
  abstract createTurno(turno: Prisma.TurnoCreateInput): Promise<Turno>;
  abstract createTurnos(
    turnos: Prisma.TurnoCreateManyInput[],
  ): Promise<{ count: number }>;
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
  abstract updateManyTurnos(turnos: Turno[]): Promise<Turno[]>;
}
