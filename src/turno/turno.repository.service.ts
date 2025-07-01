import { Injectable } from "@nestjs/common";
import { TurnoDatabaseService } from "./turno.database";
import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

@Injectable()
export class TurnoRepositoryService {
  constructor(private readonly turnoDatabaseService: TurnoDatabaseService) {}

  createTurno(turno: Prisma.TurnoCreateInput) {
    return this.turnoDatabaseService.createTurno(turno);
  }

  getTurnosPorTrabajador(idTrabajador: number, fecha: DateTime) {
    const inicio = fecha.startOf("day");
    const final = fecha.endOf("day");

    return this.turnoDatabaseService.getTurnosTrabajador(
      idTrabajador,
      inicio,
      final,
    );
  }

  getTurnosPorTienda(idTienda: number, fecha: DateTime) {
    const inicio = fecha.startOf("day");
    const final = fecha.endOf("day");

    return this.turnoDatabaseService.getTurnosPorTienda(
      idTienda,
      inicio,
      final,
    );
  }

  getTurnosPorEquipo(idResponsableEquipo: number, fecha: DateTime) {
    const inicio = fecha.startOf("day");
    const final = fecha.endOf("day");

    return this.turnoDatabaseService.getTurnosPorEquipo(
      idResponsableEquipo,
      inicio,
      final,
    );
  }
}
