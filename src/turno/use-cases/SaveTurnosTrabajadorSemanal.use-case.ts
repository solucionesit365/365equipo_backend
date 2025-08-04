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

    // 3. Update para los consolidados (filtrar turnos que se convirtieron en vacíos).
    const consolidadosValidos = consolidadosTurnosReq.filter((turno) => {
      const inicioTime = turno.inicio.toFormat("HH:mm");
      const finalTime = turno.final.toFormat("HH:mm");
      
      // Si un turno consolidado se cambió a 00:00 - 00:00, no actualizarlo (se eliminará)
      return !(inicioTime === "00:00" && finalTime === "00:00");
    });

    if (consolidadosValidos.length > 0) {
      await this.turnoRepository.updateManyTurnos(
        consolidadosValidos.map((turnoConsolidado) => ({
          idTrabajador: idTrabajador,
          inicio: turnoConsolidado.inicio.toJSDate(),
          final: turnoConsolidado.final.toJSDate(),
          borrable: turnoConsolidado.borrable,
          id: turnoConsolidado.id,
          tiendaId: turnoConsolidado.tiendaId,
          bolsaHorasInicial: 0,
        })),
      );
    }

    // 3.5. Eliminar turnos consolidados que ahora son 00:00 - 00:00
    const consolidadosParaEliminar = consolidadosTurnosReq.filter((turno) => {
      const inicioTime = turno.inicio.toFormat("HH:mm");
      const finalTime = turno.final.toFormat("HH:mm");
      
      return inicioTime === "00:00" && finalTime === "00:00";
    });

    if (consolidadosParaEliminar.length > 0) {
      for (const turno of consolidadosParaEliminar) {
        await this.turnoRepository.deleteTurno(turno.id);
      }
    }

    // 4. Create para los nuevos (filtrar turnos vacíos 00:00 - 00:00).
    const turnosNuevosValidos = nuevosTurnosReq.filter((turno) => {
      const inicioTime = turno.inicio.toFormat("HH:mm");
      const finalTime = turno.final.toFormat("HH:mm");
      
      // Ignorar turnos vacíos (00:00 - 00:00)
      return !(inicioTime === "00:00" && finalTime === "00:00");
    });

    if (turnosNuevosValidos.length > 0) {
      await this.turnoRepository.createTurnos(
        turnosNuevosValidos.map((turnoNuevo) => ({
          final: turnoNuevo.final.toJSDate(),
          inicio: turnoNuevo.inicio.toJSDate(),
          idTrabajador: idTrabajador,
          tiendaId: turnoNuevo.tiendaId,
          borrable: turnoNuevo.borrable,
        })),
      );
    }

    return this.turnoRepository.getTurnosPorTrabajador(
      idTrabajador,
      inicioSemana,
    );
  }
}
