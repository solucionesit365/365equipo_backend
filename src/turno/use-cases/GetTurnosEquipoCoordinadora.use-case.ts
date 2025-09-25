import { Injectable } from "@nestjs/common";
import { DateTime } from "luxon";
import { ICoordinadoraRepository } from "../../coordinadora/repository/interfaces/ICoordinadora.repository";
import { ITurnoRepository } from "../repository/interfaces/turno.repository.interface";
import { IGetTurnosEquipoCoordinadoraUseCase } from "./interfaces/IGetTurnosEquipoCoordinadora.use-case";
import { Turno } from "@prisma/client";
import { AusenciasDatabase } from "src/ausencias/ausencias.mongodb";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class GetTurnosEquipoCoordinadoraUseCase
  implements IGetTurnosEquipoCoordinadoraUseCase
{
  constructor(
    private readonly coordinadoraRepository: ICoordinadoraRepository,
    private readonly turnoRepository: ITurnoRepository,
    private readonly ausenciaDatabase: AusenciasDatabase,
    private readonly prisma: PrismaService,
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

    // 4. Calcular inicio y fin de la semana ISO
    const fechaInicioSemana = fecha.startOf("week");
    const fechaFinalSemana = fecha.endOf("week");

    // 5. Ausencias Mongo
    const ausencias = await this.ausenciaDatabase.getAusenciasIntervalo(
      fechaInicioSemana,
      fechaFinalSemana,
    );
    // Buscar nombre de la tienda por id
    const tienda = await this.prisma.tienda.findUnique({
      where: { id: idTienda },
      select: { nombre: true },
    });

    // Filtrar por coincidencia de nombre
    const ausenciasFiltradas = ausencias.filter(
      (a) =>
        a.tienda &&
        tienda?.nombre &&
        a.tienda.toLowerCase().trim() === tienda.nombre.toLowerCase().trim(),
    );

    // 6. Normalizar
    const ausenciasNormalizadas: Turno[] = await Promise.all(
      ausenciasFiltradas.map(async (a) => {
        const trabajador = await this.prisma.trabajador.findUnique({
          where: { id: a.idUsuario },
          select: { nombreApellidos: true },
        });

        return {
          id: `ausencia-${a._id}`,
          idTrabajador: a.idUsuario,
          inicio: a.fechaInicio,
          final: a.fechaFinal,
          tiendaId: idTienda,
          borrable: false,
          bolsaHorasInicial: 0,
          ausencia: { tipo: a.tipo },
          totalHoras: 0,
          nombre: trabajador?.nombreApellidos ?? a.nombre ?? "Sin nombre",
        };
      }),
    );
    console.log(ausenciasNormalizadas);

    return [...turnosUnicos, ...ausenciasNormalizadas];
  }
}
