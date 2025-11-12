import { Injectable } from "@nestjs/common";
import {
  IReqSaveTurnoTrabajadorIndividual,
  ISaveTurnoTrabajadorIndividualUseCase,
} from "./interfaces/ISaveTurnoTrabajadorIndividualUseCase";
import { Turno } from "@prisma/client";
import { ITurnoRepository } from "../repository/interfaces/turno.repository.interface";

@Injectable()
export class SaveTurnoTrabajadorIndividualUseCase
  implements ISaveTurnoTrabajadorIndividualUseCase
{
  constructor(private readonly turnoRepository: ITurnoRepository) {}

  async execute(
    idTrabajador: IReqSaveTurnoTrabajadorIndividual["idTrabajador"],
    dia: IReqSaveTurnoTrabajadorIndividual["dia"],
    turnos: IReqSaveTurnoTrabajadorIndividual["turnos"],
  ): Promise<Turno[]> {
    // 1. Obtener los turnos existentes del trabajador para ese día específico
    const inicioSemana = dia.startOf("week");
    const turnosBBDD = await this.turnoRepository.getTurnosPorTrabajador(
      idTrabajador,
      inicioSemana,
    );

    // Filtrar solo los turnos del día específico
    const turnosDelDiaBBDD = turnosBBDD.filter((turno) => {
      const fechaTurno = turno.inicio.toISOString().split("T")[0];
      const fechaDia = dia.toISODate();
      return fechaTurno === fechaDia;
    });

    // 2. Separar los nuevos turnos de los ya creados en una sola pasada
    const nuevosTurnosReq: typeof turnos = [];
    const consolidadosTurnosReq: typeof turnos = [];

    for (const turno of turnos) {
      if (turno.id.startsWith("tmp-")) {
        nuevosTurnosReq.push(turno);
      } else {
        consolidadosTurnosReq.push(turno);
      }
    }

    // 3. Identificar turnos que ya no están en la request (fueron eliminados)
    const idsConsolidados = new Set(consolidadosTurnosReq.map((t) => t.id));
    const turnosAEliminar = turnosDelDiaBBDD.filter(
      (turno) => !idsConsolidados.has(turno.id),
    );

    // 4. Eliminar turnos que ya no están
    for (const turno of turnosAEliminar) {
      await this.turnoRepository.deleteTurno(turno.id);
    }

    // 5. Actualizar turnos consolidados
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

    // 6. Eliminar turnos consolidados que ahora son 00:00 - 00:00
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

    // 7. Crear nuevos turnos (filtrar turnos vacíos 00:00 - 00:00)
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

    // 8. Retornar todos los turnos del trabajador para esa semana
    return this.turnoRepository.getTurnosPorTrabajador(
      idTrabajador,
      inicioSemana,
    );
  }
}
