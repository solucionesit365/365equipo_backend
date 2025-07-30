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
    const diasDiferencia = diaDeSemanaDestino.diff(diaDeSemanaOrigen, "days").days;
    
    const turnosDestino = turnosOrigen.map((turnoOrigen) => {
      // Crear objeto limpio solo con las propiedades necesarias para createMany
      return {
        id: require('crypto').randomUUID(),
        inicio: DateTime.fromJSDate(turnoOrigen.inicio)
          .plus({ days: diasDiferencia })
          .toJSDate(),
        final: DateTime.fromJSDate(turnoOrigen.final)
          .plus({ days: diasDiferencia })
          .toJSDate(),
        tiendaId: turnoOrigen.tiendaId,
        idTrabajador: turnoOrigen.idTrabajador,
        borrable: turnoOrigen.borrable,
      };
    });
    await this.turnoRepository.createTurnos(turnosDestino);
  }
}
