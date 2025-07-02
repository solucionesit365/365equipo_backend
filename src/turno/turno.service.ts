import { Injectable } from "@nestjs/common";
import { TurnoRepositoryService } from "./turno.repository.service";
import { DateTime } from "luxon";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { CoordinadoraRepositoryService } from "../coordinadora/coordinadora.repository.service";

@Injectable()
export class TurnoService {
  constructor(
    private readonly turnoRepository: TurnoRepositoryService,
    private readonly trabajadorService: TrabajadorService,
    private readonly coordinadoraRepository: CoordinadoraRepositoryService,
  ) {}

  async getTurnosCoordinadora(idTienda: number, fecha: DateTime) {
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

  getTurnosSemanalesDelTrabajador(idTrabajador: number, fecha: DateTime) {
    return this.turnoRepository.getTurnosPorTrabajador(idTrabajador, fecha);
  }
}
