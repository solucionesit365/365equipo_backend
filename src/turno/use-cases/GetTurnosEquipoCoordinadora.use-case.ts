import { Injectable } from "@nestjs/common";
import { DateTime } from "luxon";
import { ICoordinadoraRepository } from "../../coordinadora/repository/interfaces/ICoordinadora.repository";
import { ITurnoRepository } from "../repository/interfaces/turno.repository.interface";
import { IGetTurnosEquipoCoordinadoraUseCase } from "./interfaces/IGetTurnosEquipoCoordinadora.use-case";
import { Turno } from "@prisma/client";
import { AusenciasDatabase } from "src/ausencias/ausencias.mongodb";
import { PrismaService } from "src/prisma/prisma.service";
import { SolicitudVacacionesDatabase } from "src/solicitud-vacaciones/solicitud-vacaciones.mongodb";

@Injectable()
export class GetTurnosEquipoCoordinadoraUseCase
  implements IGetTurnosEquipoCoordinadoraUseCase
{
  constructor(
    private readonly coordinadoraRepository: ICoordinadoraRepository,
    private readonly turnoRepository: ITurnoRepository,
    private readonly ausenciaDatabase: AusenciasDatabase,
    private readonly vacacionesDartabase: SolicitudVacacionesDatabase,
    private readonly prisma: PrismaService,
  ) {}

  // public async execute(idTienda: number, fecha: DateTime): Promise<Turno[]> {
  //   // Los turnos del equipo de la coordinadora + los turnos de los trabajadores que trabajan en la tienda de la coordinadora + los turnos de la coordinadora, todo esto sin repeticiones de ids de turnos.
  //   const coordinadora =
  //     await this.coordinadoraRepository.getCoordinadoraPorTienda(idTienda);
  //   const turnosEquipo = await this.turnoRepository.getTurnosPorEquipo(
  //     coordinadora.id,
  //     fecha,
  //   );

  //   const turnosTienda = await this.turnoRepository.getTurnosPorTienda(
  //     coordinadora.idTienda,
  //     fecha,
  //   );

  //   const turnosCoordinadora =
  //     await this.turnoRepository.getTurnosPorTrabajador(coordinadora.id, fecha);

  //   const todosTurnos = [
  //     ...turnosEquipo,
  //     ...turnosTienda,
  //     ...turnosCoordinadora,
  //   ];

  //   // Filtra los turnos para eliminar duplicados basados en el 'id'
  //   const turnosUnicos = Array.from(
  //     new Map(todosTurnos.map((turno) => [turno.id, turno])).values(),
  //   );

  //   // 4. Calcular inicio y fin de la semana ISO
  //   const fechaInicioSemana = fecha.startOf("week");
  //   const fechaFinalSemana = fecha.endOf("week");

  //   // 5. Ausencias Mongo
  //   const ausencias = await this.ausenciaDatabase.getAusenciasIntervalo(
  //     fechaInicioSemana,
  //     fechaFinalSemana,
  //   );
  //   // Buscar nombre de la tienda por id
  //   const tienda = await this.prisma.tienda.findUnique({
  //     where: { id: idTienda },
  //     select: { nombre: true },
  //   });

  //   // Filtrar por coincidencia de nombre
  //   const ausenciasFiltradas = ausencias.filter(
  //     (a) =>
  //       a.tienda &&
  //       tienda?.nombre &&
  //       a.tienda.toLowerCase().trim() === tienda.nombre.toLowerCase().trim(),
  //   );

  //   // 6. Normalizar
  //   const ausenciasNormalizadas: Turno[] = await Promise.all(
  //     ausenciasFiltradas.map(async (a) => {
  //       const trabajador = await this.prisma.trabajador.findUnique({
  //         where: { id: a.idUsuario },
  //         select: {
  //           nombreApellidos: true,
  //           contratos: { select: { horasContrato: true } },
  //         },
  //       });

  //       const inicio = DateTime.fromJSDate(new Date(a.fechaInicio))
  //         .setZone("Europe/Madrid") // 👈 fuerza la zona
  //         .startOf("day")
  //         .toJSDate();

  //       const final = DateTime.fromJSDate(new Date(a.fechaFinal))
  //         .setZone("Europe/Madrid")
  //         .endOf("day")
  //         .toJSDate();

  //       return {
  //         id: `ausencia-${a._id}`,
  //         idTrabajador: a.idUsuario,
  //         inicio,
  //         final,
  //         tiendaId: idTienda,
  //         borrable: false,
  //         bolsaHorasInicial: 0,
  //         ausencia: { tipo: a.tipo },
  //         totalHoras: 0,
  //         nombre: trabajador?.nombreApellidos ?? a.nombre ?? "Sin nombre",
  //         horasContrato: trabajador.contratos?.[0]?.horasContrato ?? 0,
  //       };
  //     }),
  //   );

  //   // 7. Vacaciones Mongo por tienda y aprobadas en el intervalo
  //   const vacacionesTienda =
  //     await this.vacacionesDartabase.getVacacionesByTiendas(
  //       tienda?.nombre ?? "",
  //     );

  //   const vacacionesSemana = vacacionesTienda.filter((v) => {
  //     const inicio = DateTime.fromFormat(v.fechaInicio, "dd/MM/yyyy");
  //     const final = DateTime.fromFormat(v.fechaFinal, "dd/MM/yyyy");

  //     return (
  //       v.estado === "APROBADA" &&
  //       inicio <= fechaFinalSemana &&
  //       final >= fechaInicioSemana
  //     );
  //   });

  //   const vacacionesNormalizadas: Turno[] = vacacionesSemana.map((v) => {
  //     const inicio = DateTime.fromFormat(v.fechaInicio, "dd/MM/yyyy")
  //       .setZone("Europe/Madrid")
  //       .startOf("day")
  //       .toJSDate();

  //     const final = DateTime.fromFormat(v.fechaFinal, "dd/MM/yyyy")
  //       .setZone("Europe/Madrid")
  //       .endOf("day")
  //       .toJSDate();

  //     return {
  //       id: `vacacion-${v._id}`,
  //       idTrabajador: v.idBeneficiario,
  //       inicio,
  //       final,
  //       tiendaId: idTienda,
  //       borrable: false,
  //       bolsaHorasInicial: 0,
  //       ausencia: { tipo: "VACACIONES" },
  //       totalHoras: 0,
  //       nombre: v.nombreApellidos ?? "Sin nombre",
  //       horasContrato: v.horasContrato ?? 0, // viene en mongo
  //     };
  //   });

  //   return [
  //     ...turnosUnicos,
  //     ...ausenciasNormalizadas,
  //     ...vacacionesNormalizadas,
  //   ];
  // }

  public async execute(idTienda: number, fecha: DateTime): Promise<Turno[]> {
    // Obtener coordinadora (principal + adicionales)
    const coordinadoras =
      await this.coordinadoraRepository.getCoordinadoraPorTienda(idTienda);

    if (!coordinadoras || !coordinadoras.principal) {
      throw new Error("Coordinadora principal no encontrada");
    }

    // Acceder al ID de la coordinadora principal
    const coordinadoraId = coordinadoras.principal.id;

    // Los turnos del equipo de la coordinadora + los turnos de los trabajadores que trabajan en la tienda de la coordinadora + los turnos de la coordinadora, todo esto sin repeticiones de ids de turnos.
    const turnosEquipo = await this.turnoRepository.getTurnosPorEquipo(
      coordinadoraId,
      fecha,
    );
    const turnosTienda = await this.turnoRepository.getTurnosPorTienda(
      coordinadoraId,
      fecha,
    );
    const turnosCoordinadora =
      await this.turnoRepository.getTurnosPorTrabajador(coordinadoraId, fecha);

    const todosTurnos = [
      ...turnosEquipo,
      ...turnosTienda,
      ...turnosCoordinadora,
    ];

    // Filtra los turnos para eliminar duplicados basados en el 'id'
    const turnosUnicos = Array.from(
      new Map(todosTurnos.map((turno) => [turno.id, turno])).values(),
    );

    // Calcular inicio y fin de la semana ISO
    const fechaInicioSemana = fecha.startOf("week");
    const fechaFinalSemana = fecha.endOf("week");

    // Ausencias Mongo
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

    // Normalizar
    const ausenciasNormalizadas: Turno[] = await Promise.all(
      ausenciasFiltradas.map(async (a) => {
        const trabajador = await this.prisma.trabajador.findUnique({
          where: { id: a.idUsuario },
          select: {
            nombreApellidos: true,
            contratos: { select: { horasContrato: true } },
          },
        });

        const inicio = DateTime.fromJSDate(new Date(a.fechaInicio))
          .setZone("Europe/Madrid") // 👈 fuerza la zona
          .startOf("day")
          .toJSDate();

        const final = DateTime.fromJSDate(new Date(a.fechaFinal))
          .setZone("Europe/Madrid")
          .endOf("day")
          .toJSDate();

        return {
          id: `ausencia-${a._id}`,
          idTrabajador: a.idUsuario,
          inicio,
          final,
          tiendaId: idTienda,
          borrable: false,
          bolsaHorasInicial: 0,
          ausencia: { tipo: a.tipo },
          totalHoras: 0,
          nombre: trabajador?.nombreApellidos ?? a.nombre ?? "Sin nombre",
          horasContrato: trabajador.contratos?.[0]?.horasContrato ?? 0,
        };
      }),
    );

    // Vacaciones Mongo por tienda y aprobadas en el intervalo
    const vacacionesTienda =
      await this.vacacionesDartabase.getVacacionesByTiendas(
        tienda?.nombre ?? "",
      );
    const vacacionesSemana = vacacionesTienda.filter((v) => {
      const inicio = DateTime.fromFormat(v.fechaInicio, "dd/MM/yyyy");
      const final = DateTime.fromFormat(v.fechaFinal, "dd/MM/yyyy");

      return (
        v.estado === "APROBADA" &&
        inicio <= fechaFinalSemana &&
        final >= fechaInicioSemana
      );
    });

    const vacacionesNormalizadas: Turno[] = vacacionesSemana.map((v) => {
      const inicio = DateTime.fromFormat(v.fechaInicio, "dd/MM/yyyy")
        .setZone("Europe/Madrid")
        .startOf("day")
        .toJSDate();

      const final = DateTime.fromFormat(v.fechaFinal, "dd/MM/yyyy")
        .setZone("Europe/Madrid")
        .endOf("day")
        .toJSDate();

      return {
        id: `vacacion-${v._id}`,
        idTrabajador: v.idBeneficiario,
        inicio,
        final,
        tiendaId: idTienda,
        borrable: false,
        bolsaHorasInicial: 0,
        ausencia: { tipo: "VACACIONES" },
        totalHoras: 0,
        nombre: v.nombreApellidos ?? "Sin nombre",
        horasContrato: v.horasContrato ?? 0, // viene en mongo
      };
    });

    return [
      ...turnosUnicos,
      ...ausenciasNormalizadas,
      ...vacacionesNormalizadas,
    ];
  }
}
