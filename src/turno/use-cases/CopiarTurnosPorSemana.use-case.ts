import { Injectable } from "@nestjs/common";
import { ICopiarTurnosPorSemanaUseCase } from "./interfaces/ICopiarTurnosPorSemana.use-case";
import { DateTime } from "luxon";
import { IGetTurnosEquipoCoordinadoraUseCase } from "./interfaces/IGetTurnosEquipoCoordinadora.use-case";
import { ITurnoRepository } from "../repository/interfaces/turno.repository.interface";

@Injectable()
export class CopiarTurnosPorSemanaUseCase
  implements ICopiarTurnosPorSemanaUseCase
{
  constructor(
    private readonly getTurnosEquipoCoordinadoraUseCase: IGetTurnosEquipoCoordinadoraUseCase,
    private readonly turnoRepository: ITurnoRepository,
  ) {}

  async execute(
    tiendaID: number,
    diaDeSemanaOrigen: DateTime,
    diaDeSemanaDestino: DateTime,
  ): Promise<void> {
    // Precondiciones:
    // - diaDeSemanaDestino no puede tener turnos existentes
    // - diaDeSemanaOrigen debe tener turnos existentes
    // - diaDeSemanaDestino debe ser posterior a diaDeSemanaOrigen

    // Obtener los turnos de la semana origen
    // Crear los turnos en la semana destino (sumando 7 días a cada turno de la semana origen)
    // Insertar los turnos de la semana destino en la base de datos

    const turnosOrigen = await this.getTurnosEquipoCoordinadoraUseCase.execute(
      tiendaID,
      diaDeSemanaOrigen,
    );
    const turnosDestino = turnosOrigen.map((turnoOrigen) => {
      return {
        ...turnoOrigen,
        inicio: DateTime.fromJSDate(turnoOrigen.inicio)
          .plus({
            days: diaDeSemanaDestino.diff(diaDeSemanaOrigen, "days").days,
          })
          .toJSDate(),
        final: DateTime.fromJSDate(turnoOrigen.final)
          .plus({
            days: diaDeSemanaDestino.diff(diaDeSemanaOrigen, "days").days,
          })
          .toJSDate(),
      };
    });
    await this.turnoRepository.createTurnos(turnosDestino);
  }
}
