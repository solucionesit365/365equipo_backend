import { Injectable } from "@nestjs/common";
import { ITurnoRepository } from "../repository/interfaces/turno.repository.interface";
import { IGetTurnoDelDiaUseCase } from "./interfaces/IGetTurnoDelDia.use-case";
import { Turno } from "@prisma/client";
import { DateTime } from "luxon";

@Injectable()
export class GetTurnoDelDiaUseCase implements IGetTurnoDelDiaUseCase {
  constructor(private readonly turnoRepository: ITurnoRepository) {}

  execute(idTrabajador: number, fecha: DateTime): Promise<Turno> {
    const fechaInicio = fecha.startOf("day");
    const fechaFinal = fecha.endOf("day");

    return this.turnoRepository.getTurnoDelDia(
      idTrabajador,
      fechaInicio,
      fechaFinal,
    );
  }
}
