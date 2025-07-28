import { Injectable } from "@nestjs/common";
import {
  IReqSaveTurnosTrabajadorSemanal,
  ISaveTurnosTrabajadorSemanalUseCase,
} from "./interfaces/ISaveTurnosTrabajadorSemanalUseCase";
import { Turno } from "@prisma/client";
import { ITurnoRepository } from "../repository/interfaces/turno.repository.interface";

@Injectable()
export class SaveTurnosTrabajadorSemanalUseCase
  implements ISaveTurnosTrabajadorSemanalUseCase
{
  constructor(private readonly turnoRepository: ITurnoRepository) {}

  async execute(
    idTrabajador: IReqSaveTurnosTrabajadorSemanal["idTrabajador"],
    inicioSemana: IReqSaveTurnosTrabajadorSemanal["inicioSemana"],
    arrayTurnos: IReqSaveTurnosTrabajadorSemanal["arrayTurnos"],
  ): Promise<Turno[]> {
    // 1. Obtener los turnos de la bbdd de este trabajador en esa semana.
    const turnosBBDD = await this.turnoRepository.getTurnosPorTrabajador(
      idTrabajador,
      inicioSemana,
    );

    // 2. Separar los nuevos turnos de los ya creados del parámetro arrayTurnos en una sola pasada
    const nuevosTurnosReq: typeof arrayTurnos = [];
    const consolidadosTurnosReq: typeof arrayTurnos = [];

    for (const turno of arrayTurnos) {
      if (turno.id.startsWith("tmp-")) {
        nuevosTurnosReq.push(turno);
      } else {
        consolidadosTurnosReq.push(turno);
      }
    }

    // 3. Update para los consolidados.
    await this.turnoRepository.updateManyTurnos(
      consolidadosTurnosReq.map((turnoConsolidado) => ({
        idTrabajador: idTrabajador,
        inicio: turnoConsolidado.inicio.toJSDate(),
        final: turnoConsolidado.final.toJSDate(),
        borrable: turnoConsolidado.borrable,
        id: turnoConsolidado.id,
        tiendaId: turnoConsolidado.tiendaId,
        bolsaHorasInicial: 0,
      })),
    );

    // 4. Create para los nuevos.
    await this.turnoRepository.createTurnos(
      nuevosTurnosReq.map((turnoNuevo) => ({
        final: turnoNuevo.final.toJSDate(),
        inicio: turnoNuevo.inicio.toJSDate(),
        idTrabajador: idTrabajador,
        tiendaId: turnoNuevo.tiendaId,
        borrable: turnoNuevo.borrable,
      })),
    );

    return this.turnoRepository.getTurnosPorTrabajador(
      idTrabajador,
      inicioSemana,
    );
  }
}
