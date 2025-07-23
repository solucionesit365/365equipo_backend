import { Injectable } from "@nestjs/common";
import { DateTime } from "luxon";
import { ICoordinadoraRepository } from "../../coordinadora/coordinadora.repository.interface";
import { ITurnoRepository } from "../repository/interfaces/turno.repository.interface";
import { IGetTurnosEquipoCoordinadoraUseCase } from "./interfaces/IGetTurnosEquipoCoordinadora.use-case";
import { Turno } from "@prisma/client";

@Injectable()
export class GetTurnosEquipoCoordinadoraUseCase
  implements IGetTurnosEquipoCoordinadoraUseCase
{
  constructor(
    private readonly coordinadoraRepository: ICoordinadoraRepository,
    private readonly turnoRepository: ITurnoRepository,
  ) {}

  public async execute(idTienda: number, fecha: DateTime): Promise<Turno[]> {
    // Los turnos del equipo de la coordinadora + los turnos de los trabajadores que trabajan en la tienda de la coordinadora + los turnos de la coordinadora, todo esto sin repeticiones de ids de turnos.
    const coordinadora =
      await this.coordinadoraRepository.getCoordinadoraPorTienda(idTienda);
    const turnosEquipo = await this.turnoRepository.getTurnosPorEquipo(
      coordinadora.id,
      fecha,
    );

    const turnosTienda = await this.turnoRepository.getTurnosPorTienda(
      coordinadora.idTienda,
      fecha,
    );

    const turnosCoordinadora =
      await this.turnoRepository.getTurnosPorTrabajador(coordinadora.id, fecha);

    const todosTurnos = [
      ...turnosEquipo,
      ...turnosTienda,
      ...turnosCoordinadora,
    ];

    // Filtra los turnos para eliminar duplicados basados en el 'id'
    const turnosUnicos = Array.from(
      new Map(todosTurnos.map((turno) => [turno.id, turno])).values(),
    );

    return turnosUnicos;
  }
}
