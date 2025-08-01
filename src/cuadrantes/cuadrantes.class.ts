import { Injectable, Inject, forwardRef } from "@nestjs/common";
// import * as moment from "moment";
// import { CuadrantesDatabase } from "./cuadrantes.mongodb";
// import { ObjectId, WithId } from "mongodb";
// import { TCuadrante } from "./cuadrantes.interface";
// import { Tienda } from "../tiendas/tiendas.class";
// import { AusenciaInterface } from "../ausencias/ausencias.interface";
// import { TrabajadorService } from "../trabajadores/trabajadores.class";
// import { FichajesValidadosService } from "../fichajes-validados/fichajes-validados.class";
// import { DateTime } from "luxon";
// import { ContratoService } from "../contrato/contrato.service";
// import { Trabajador } from "@prisma/client";
// import { CopiarSemanaCuadranteDto } from "./cuadrantes.dto";

// moment.locale("custom", {
//   week: {
//     dow: 1, // Lunes es el primer día de la semana
//   },
// });

@Injectable()
export class Cuadrantes {
  // constructor(
  //   private readonly schCuadrantes: CuadrantesDatabase,
  //   private readonly contratoService: ContratoService,
  //   private readonly tiendasInstance: Tienda,
  //   @Inject(forwardRef(() => TrabajadorService))
  //   private readonly trabajadoresInstance: TrabajadorService,
  //   private readonly fichajesValidadosInstance: FichajesValidadosService,
  // ) {}
  // // Cuadrante 2.0
  // async getCuadrantesIndividual(
  //   idTrabajador: number,
  //   fechaInicioBusqueda: DateTime,
  //   fechaFinalBusqueda: DateTime,
  // ) {
  //   const arrayCuadrantesTrabajador =
  //     await this.schCuadrantes.getCuadrantesIndividual(
  //       idTrabajador,
  //       fechaInicioBusqueda,
  //       fechaFinalBusqueda,
  //     );
  //   const nombreTrabajador = (
  //     await this.trabajadoresInstance.getTrabajadorBySqlId(idTrabajador)
  //   ).nombreApellidos;
  //   const resultado = await this.addEmptyDays(
  //     arrayCuadrantesTrabajador,
  //     idTrabajador,
  //     nombreTrabajador,
  //     fechaInicioBusqueda,
  //     fechaFinalBusqueda,
  //   );
  //   return resultado;
  // }
  // // Cuadrantes 2.0 INCOMPLETO!!!
  // async borrarTurno(idTurno: string) {
  //   // FALTA AGREGAR UN TRIGGER PARA MODIFICARLO EN HIT TAMBIÉN !!!
  //   return await this.schCuadrantes.borrarTurno(idTurno);
  // }
  // async borrarTurnoByPlan(idPlan: string) {
  //   // FALTA AGREGAR UN TRIGGER PARA MODIFICARLO EN HIT TAMBIÉN !!!
  //   return await this.schCuadrantes.borrarTurnoByPlan(idPlan);
  // }
  // private async addEmptyDays(
  //   arrayCuadrantes: WithId<TCuadrante>[],
  //   idTrabajador: number,
  //   nombreTrabajador: string,
  //   inicioSemana: DateTime,
  //   finalSemana: DateTime,
  // ) {
  //   let diaActual = inicioSemana;
  //   const diasCompletos: WithId<TCuadrante>[] = [];
  //   const horasContrato = await this.contratoService.getHorasContratoByIdNew(
  //     idTrabajador,
  //     inicioSemana,
  //   );
  //   while (diaActual <= finalSemana) {
  //     // Cuenta cuántas veces el día actual aparece en arrayCuadrantes
  //     const vecesDia = arrayCuadrantes.filter((cuadrante) =>
  //       DateTime.fromJSDate(cuadrante.inicio).hasSame(diaActual, "day"),
  //     ).length;
  //     if (vecesDia === 0) {
  //       // Si el día no está en arrayCuadrantes, lo añade con inicio y final a las 00:00
  //       diasCompletos.push({
  //         _id: new ObjectId(),
  //         enviado: false,
  //         historialPlanes: [],
  //         horasContrato: horasContrato,
  //         idPlan: new ObjectId().toJSON(),
  //         idTrabajador: idTrabajador,
  //         nombre: nombreTrabajador,
  //         totalHoras: 0,
  //         inicio: diaActual.toJSDate(),
  //         final: diaActual.toJSDate(),
  //         idTienda: null,
  //         ausencia: null,
  //         bolsaHorasInicial: null, // OJO, MIRAR ESTO 3.0
  //       });
  //     } else {
  //       // Si el día está en arrayCuadrantes, añade todos los cuadrantes de ese día
  //       const cuadrantesDia = arrayCuadrantes.filter((cuadrante) =>
  //         DateTime.fromJSDate(cuadrante.inicio).hasSame(diaActual, "day"),
  //       );
  //       diasCompletos.push(...cuadrantesDia);
  //     }
  //     diaActual = diaActual.plus({ days: 1 });
  //   }
  //   return diasCompletos;
  // }
  // // Cuadrantes 2.0
  // async getBolsaHorasById(
  //   idSql: number,
  //   fecha: DateTime,
  //   horasContrato: number,
  // ): Promise<number> {
  //   const { horasMasMenos } = await this.getBolsaInicial(idSql, fecha);
  //   return horasContrato + horasMasMenos;
  // }
  // // Cuadrantes 2.0
  // async getBolsaInicial(idTrabajador: number, lunesActual: DateTime) {
  //   const lunesAnterior = lunesActual.minus({ days: 7 }).startOf("week");
  //   const domingoAnterior = lunesActual.minus({ days: 1 }).endOf("week");
  //   const fichajesValidados =
  //     await this.fichajesValidadosInstance.getParaCuadranteNew(
  //       lunesAnterior,
  //       domingoAnterior,
  //       idTrabajador,
  //     );
  //   let horasCuadranteTotal = 0;
  //   let horasMasMenos = 0;
  //   for (let i = 0; i < fichajesValidados.length; i += 1) {
  //     horasMasMenos +=
  //       fichajesValidados[i].horasExtra +
  //       fichajesValidados[i].horasAprendiz +
  //       fichajesValidados[i].horasCoordinacion;
  //     horasCuadranteTotal = horasMasMenos;
  //   }
  //   return {
  //     horasCuadranteTotal,
  //     horasMasMenos,
  //   };
  // }
  // async recuentoTiendasIndividual(
  //   idTrabajador: number,
  //   inicioSemana: DateTime,
  //   finalSemana: DateTime,
  // ): Promise<number[]> {
  //   const cuadrantesTrabajador =
  //     await this.schCuadrantes.getCuadrantesIndividual(
  //       idTrabajador,
  //       inicioSemana,
  //       finalSemana,
  //     );
  //   const tiendasSet = new Set<number>();
  //   for (const cuadrante of cuadrantesTrabajador) {
  //     tiendasSet.add(cuadrante.idTienda);
  //   }
  //   return [...tiendasSet];
  // }
  // async recuentoTiendasSubordinados(
  //   arrayTrabajadores: number[],
  //   inicioSemana: DateTime,
  //   finalSemana: DateTime,
  // ): Promise<number[]> {
  //   const tiendasSet = new Set<number>();
  //   for (const idTrabajador of arrayTrabajadores) {
  //     const cuadrantesTrabajador =
  //       await this.schCuadrantes.getCuadrantesIndividual(
  //         idTrabajador,
  //         inicioSemana,
  //         finalSemana,
  //       );
  //     for (const cuadrante of cuadrantesTrabajador) {
  //       tiendasSet.add(cuadrante.idTienda);
  //     }
  //   }
  //   return [...tiendasSet];
  // }
  // async getCuadranteDependienta(idTrabajador: number, fechaBusqueda: DateTime) {
  //   const fechaInicioSemana = fechaBusqueda.startOf("week");
  //   const fechaFinalSemana = fechaBusqueda.endOf("week");
  //   const puestosTrabajo = await this.recuentoTiendasIndividual(
  //     idTrabajador,
  //     fechaInicioSemana,
  //     fechaFinalSemana,
  //   );
  //   const cuadrantes: TCuadrante[] = [];
  //   for (let i = 0; i < puestosTrabajo.length; i += 1) {
  //     cuadrantes.push(
  //       ...(await this.schCuadrantes.getCuadrantes(
  //         puestosTrabajo[i],
  //         fechaInicioSemana,
  //         fechaFinalSemana,
  //       )),
  //     );
  //   }
  //   return cuadrantes;
  // }
  // async getCaudrantesEquipo(idTienda: number, fechaBusqueda: DateTime) {
  //   const fechaInicioSemana = fechaBusqueda.startOf("week");
  //   const fechaFinalSemana = fechaBusqueda.endOf("week");
  //   const responsableTienda =
  //     await this.trabajadoresInstance.getResponsableTienda(idTienda);
  //   const arrayIdSubordinados =
  //     await this.trabajadoresInstance.getSubordinadosByIdNew(
  //       responsableTienda.id,
  //       fechaInicioSemana,
  //     );
  //   // Incluimos al responsable en el array de trabajadores
  //   const trabajadoresIds = [
  //     responsableTienda.id,
  //     ...arrayIdSubordinados.map((t) => t.id),
  //   ];
  //   // Obtenemos los cuadrantes de todos los trabajadores del equipo para esa semana
  //   const cuadrantesEquipo: TCuadrante[] = [];
  //   for (const idTrabajador of trabajadoresIds) {
  //     const cuadrantes = await this.schCuadrantes.getCuadrantesIndividual(
  //       idTrabajador,
  //       fechaInicioSemana,
  //       fechaFinalSemana,
  //     );
  //     cuadrantesEquipo.push(...cuadrantes);
  //   }
  //   return cuadrantesEquipo;
  // }
  // async getCuadranteCoordinadora(
  //   idTrabajador: number,
  //   arrayIdSubordinados: number[],
  //   fechaBusqueda: DateTime,
  //   idTienda: number,
  // ): Promise<TCuadrante[]> {
  //   const fechaInicioSemana = fechaBusqueda.startOf("week");
  //   const fechaFinalSemana = fechaBusqueda.endOf("week");
  //   const cuadrantesSubordinados =
  //     await this.schCuadrantes.getCuadrantesSubordinados(
  //       arrayIdSubordinados,
  //       fechaInicioSemana,
  //       fechaFinalSemana,
  //     );
  //   const cuadrantesPropiosCoordi =
  //     await this.schCuadrantes.getCuadrantesIndividual(
  //       idTrabajador,
  //       fechaInicioSemana,
  //       fechaFinalSemana,
  //     );
  //   const cuadrantesExternosTienda = await this.schCuadrantes.getCuadrantes(
  //     idTienda,
  //     fechaInicioSemana,
  //     fechaFinalSemana,
  //   );
  //   const allCuadrantes = [
  //     ...cuadrantesSubordinados,
  //     ...cuadrantesPropiosCoordi,
  //     ...cuadrantesExternosTienda,
  //   ];
  //   const uniqueMap = new Map();
  //   allCuadrantes.forEach((cuadrante) => {
  //     const id = cuadrante._id.toString();
  //     uniqueMap.set(id, cuadrante);
  //   });
  //   const cuadrantesUnicos = Array.from(uniqueMap.values());
  //   return cuadrantesUnicos;
  // }
  // async getCuadranteSupervisora(
  //   idTienda: number,
  //   fechaBusqueda: DateTime,
  // ): Promise<TCuadrante[]> {
  //   const fechaInicioSemana = fechaBusqueda.startOf("week");
  //   const fechaFinalSemana = fechaBusqueda.endOf("week");
  //   return await this.schCuadrantes.getCuadrantes(
  //     idTienda,
  //     fechaInicioSemana,
  //     fechaFinalSemana,
  //   );
  // }
  // // Vieja, después borrarla
  // async getCuadrantesOld(
  //   idTienda: number,
  //   fechaBusqueda: DateTime,
  //   role: "DEPENDIENTA" | "COORDINADORA" | "SUPERVISORA",
  //   idSql?: number,
  // ) {
  //   const fechaInicioSemana = fechaBusqueda.startOf("week");
  //   const fechaFinalSemana = fechaBusqueda.endOf("week");
  //   const responsableTienda =
  //     await this.trabajadoresInstance.getResponsableTienda(idTienda);
  //   const equipoCompleto =
  //     await this.trabajadoresInstance.getSubordinadosByIdNew(
  //       responsableTienda.id,
  //       fechaInicioSemana,
  //     );
  //   if (idSql) {
  //     const usuarioActual =
  //       await this.trabajadoresInstance.getTrabajadorBySqlId(idSql);
  //     const horasContratoCurrentUser =
  //       await this.contratoService.getHorasContratoByIdNew(
  //         idSql,
  //         fechaInicioSemana,
  //       );
  //     (usuarioActual.contratos[0].horasContrato =
  //       (horasContratoCurrentUser * 100) / 40),
  //       equipoCompleto.push(usuarioActual);
  //   }
  //   const cuadrantes: TCuadrante[] = await this.schCuadrantes.getCuadrantes(
  //     idTienda,
  //     fechaInicioSemana,
  //     fechaFinalSemana,
  //   );
  //   const cuadrantesVacios: TCuadrante[] = [];
  //   let hayUno = false;
  //   for (let i = 0; i < equipoCompleto.length; i += 1) {
  //     for (let j = 0; j < cuadrantes.length; j += 1) {
  //       if (equipoCompleto[i].id === cuadrantes[j].idTrabajador) {
  //         hayUno = true;
  //         cuadrantes[j]["horasContrato"] =
  //           (equipoCompleto[i].contratos[0].horasContrato * 40) / 100;
  //         break;
  //       }
  //     }
  //     if (!hayUno) {
  //       const nuevoCuadrante: TCuadrante = {
  //         _id: new ObjectId(),
  //         idTrabajador: equipoCompleto[i].id,
  //         nombre: equipoCompleto[i].nombreApellidos,
  //         idTienda: idTienda,
  //         totalHoras: 0,
  //         enviado: false,
  //         historialPlanes: [],
  //         horasContrato:
  //           (equipoCompleto[i].contratos[0].horasContrato * 40) / 100,
  //         idPlan: null,
  //         inicio: undefined,
  //         final: undefined,
  //         ausencia: null,
  //         bolsaHorasInicial: 0,
  //       };
  //       cuadrantesVacios.push(nuevoCuadrante);
  //     }
  //   }
  //   cuadrantes.push(...cuadrantesVacios);
  //   // Cuadrantes multitienda:
  //   // Falta añadir un tercer push, para los trabajadores que vienen de otro responsable,
  //   // pero que van a trabajar a esta tienda. Se deben mostrar todos los que vengan a trabajar
  //   // a la tienda aunque no sean subordinados de la tienda destino
  //   for (let i = 0; i < cuadrantes.length; i += 1) {
  //     cuadrantes[i]["bolsaHorasInicial"] = await this.getBolsaHorasById(
  //       cuadrantes[i].idTrabajador,
  //       DateTime.fromJSDate(cuadrantes[i].inicio),
  //       cuadrantes[i].horasContrato,
  //     );
  //     if (!cuadrantes[i].horasContrato) {
  //       const trabajadorCuadrante =
  //         await this.trabajadoresInstance.getTrabajadorBySqlId(
  //           cuadrantes[i].idTrabajador,
  //         );
  //       cuadrantes[i].horasContrato =
  //         (Number(trabajadorCuadrante.contratos[0].horasContrato) * 40) / 100;
  //     }
  //   }
  //   return cuadrantes;
  // }
  // // Cuadrantes 2.0
  // async getTodo() {
  //   return await this.schCuadrantes.getTodo();
  // }
  // // Cuadrantes 2.0
  // async getTiendas1Semana(fecha: DateTime) {
  //   const fechaInicio = fecha.startOf("week");
  //   const fechaFinal = fecha.endOf("week");
  //   return await this.schCuadrantes.getTiendas1Semana(fechaInicio, fechaFinal);
  // }
  // // Cuadrantes 2.0
  // async getSemanas1Tienda(idTienda: number) {
  //   return await this.schCuadrantes.getSemanas1Tienda(idTienda);
  // }
  // async getTiendasSemana(idTienda: number, fecha: DateTime) {
  //   const fechaInicio = fecha.startOf("week");
  //   const fechaFinal = fecha.endOf("week");
  //   return await this.schCuadrantes.getTiendasSemana(
  //     Number(idTienda),
  //     fechaInicio,
  //     fechaFinal,
  //   );
  // }
  // // Cuadrantes 2.0
  // private async getPendientesEnvio() {
  //   return await this.schCuadrantes.getPendientesEnvio();
  // }
  // // Cuadrantes 2.0
  // async getCuadranteSemanaTrabajador(idTrabajador: number, fecha: DateTime) {
  //   const fechaInicio = fecha.startOf("week");
  //   const fechaFinal = fecha.endOf("week");
  //   return await this.schCuadrantes.getCuadrantesIndividual(
  //     idTrabajador,
  //     fechaInicio,
  //     fechaFinal,
  //   );
  // }
  // // Cuadrantes 2.0 guardado nuevo
  // async saveCuadrante(cuadrantes: TCuadrante[], oldCuadrante: TCuadrante[]) {
  //   const cuadrantesModificables: TCuadrante[] = [];
  //   const cuadrantesParaAgregar: TCuadrante[] = [];
  //   let coincidencia: boolean;
  //   for (let i = 0; i < cuadrantes.length; i += 1) {
  //     coincidencia = false;
  //     for (let j = 0; j < oldCuadrante.length; j += 1) {
  //       if (cuadrantes[i]._id.toString() === oldCuadrante[j]._id.toString()) {
  //         cuadrantesModificables.push(cuadrantes[i]);
  //         coincidencia = true;
  //         break;
  //       }
  //     }
  //     if (coincidencia === false) cuadrantesParaAgregar.push(cuadrantes[i]);
  //   }
  //   await this.schCuadrantes.guardarCuadrantes(
  //     cuadrantesModificables,
  //     cuadrantesParaAgregar,
  //   );
  //   return true;
  // }
  // // Cuadrantes 2.0
  // async addAusenciaToCuadrantes(ausencia: AusenciaInterface) {
  //   const fechaInicio = DateTime.fromJSDate(ausencia.fechaInicio);
  //   const fechaFinal = ausencia.fechaFinal
  //     ? DateTime.fromJSDate(ausencia.fechaFinal)
  //     : DateTime.fromJSDate(ausencia.fechaRevision);
  //   const cuadrantesFinal: TCuadrante[] = [];
  //   const cuadrantesEnMedio = await this.schCuadrantes.getCuadrantesIndividual(
  //     ausencia.idUsuario,
  //     DateTime.fromJSDate(ausencia.fechaInicio),
  //     DateTime.fromJSDate(ausencia.fechaFinal),
  //   );
  //   const trabajador = await this.trabajadoresInstance.getTrabajadorBySqlId(
  //     ausencia.idUsuario,
  //   );
  //   let auxFecha = fechaInicio;
  //   while (auxFecha <= fechaFinal) {
  //     const cuadranteMolesto = cuadrantesEnMedio.find((cuadrante) =>
  //       DateTime.fromJSDate(cuadrante.inicio).hasSame(auxFecha, "day"),
  //     );
  //     if (cuadranteMolesto) {
  //       cuadranteMolesto.ausencia = {
  //         tipo: ausencia.tipo,
  //         completa: ausencia.completa,
  //         horas: ausencia.completa ? undefined : ausencia.horas,
  //         idAusencia: ausencia._id,
  //       };
  //       cuadrantesFinal.push(cuadranteMolesto);
  //     } else {
  //       cuadrantesFinal.push({
  //         _id: new ObjectId(),
  //         idTrabajador: ausencia.idUsuario,
  //         idPlan: new ObjectId().toString(),
  //         idTienda: trabajador.idTienda,
  //         inicio: auxFecha.toJSDate(),
  //         final: auxFecha.toJSDate(),
  //         nombre: trabajador.nombreApellidos,
  //         totalHoras: 0,
  //         enviado: false,
  //         historialPlanes: [],
  //         horasContrato:
  //           (Number(trabajador.contratos[0].horasContrato) * 40) / 100,
  //         bolsaHorasInicial: null, // OJO, MIRAR ESTO BIEN 3.0
  //         ausencia: {
  //           tipo: ausencia.tipo,
  //           completa: ausencia.completa,
  //           horas: ausencia.completa ? undefined : ausencia.horas,
  //           idAusencia: ausencia._id,
  //         },
  //       });
  //     }
  //     auxFecha = auxFecha.plus({ day: 1 });
  //   }
  //   await this.schCuadrantes.updateOrInsertManyCuadrantes(cuadrantesFinal);
  // }
  // getRole(usuario: Trabajador): "DEPENDIENTA" | "COORDINADORA" | "SUPERVISORA" {
  //   if (usuario.llevaEquipo) {
  //     return usuario.idTienda ? "COORDINADORA" : "SUPERVISORA";
  //   } else if (usuario.idTienda) {
  //     return "DEPENDIENTA";
  //   }
  //   throw Error("Paso no autorizado. No es de ventas.");
  // }
  // //Borrar las ausencias de cuadrantes2 se llama en ausencias.class
  // async removeAusenciaFromCuadrantes(
  //   tipo: string,
  //   idUsuario: number,
  //   fechaInicio: Date,
  //   fechaFinal: Date,
  // ) {
  //   return await this.schCuadrantes.removeAusenciaFromCuadrantes(
  //     tipo,
  //     idUsuario,
  //     fechaInicio,
  //     fechaFinal,
  //   );
  // }
  // //Borrar las vacaciones de cuadrantes2 se llama en solicitud-vacaciones.class
  // async removeVacacionesFromCuadrantes(
  //   idUsuario: number,
  //   fechaInicio: Date,
  //   fechaFinal: Date,
  // ) {
  //   return await this.schCuadrantes.removeVacacionesFromCuadrantes(
  //     idUsuario,
  //     fechaInicio,
  //     fechaFinal,
  //   );
  // }
  // /*
  //  * Lo que sería el cuadrante pero diario
  //  */
  // async getTurnoDia(idTrabajador: number, fecha: DateTime) {
  //   const fechaInicio = fecha.startOf("day");
  //   const fechaFinal = fecha.endOf("day");
  //   const resTurno = await this.schCuadrantes.getTurnoDia(
  //     idTrabajador,
  //     fechaInicio,
  //     fechaFinal,
  //   );
  //   if (resTurno) return resTurno;
  //   return null;
  // }
  // async copiarSemanaCuadrante(reqCopiar: CopiarSemanaCuadranteDto) {
  //   const diaSemanaOrigen = DateTime.fromJSDate(reqCopiar.fechaSemanaOrigen);
  //   const diaSemanaDestino = DateTime.fromJSDate(reqCopiar.fechaSemanaDestino);
  //   const inicioSemanaOrigen = diaSemanaOrigen.startOf("week");
  //   const finalSemanaOrigen = diaSemanaOrigen.endOf("week");
  //   const inicioSemanaDestino = diaSemanaDestino.startOf("week");
  //   const diferenciaDias = inicioSemanaDestino.diff(
  //     inicioSemanaOrigen,
  //     "days",
  //   ).days;
  //   const cuadrantes = await this.schCuadrantes.getCuadrantes(
  //     reqCopiar.idTienda,
  //     inicioSemanaOrigen,
  //     finalSemanaOrigen,
  //   );
  //   if (cuadrantes.length > 0) {
  //     const cuadrantesFechasModificadas = cuadrantes.map((cuadrante) => {
  //       const fechaInicio = DateTime.fromJSDate(cuadrante.inicio);
  //       const fechaFinal = DateTime.fromJSDate(cuadrante.final);
  //       const nuevaFechaInicio = fechaInicio.plus({ days: diferenciaDias });
  //       const nuevaFechaFinal = fechaFinal.plus({ days: diferenciaDias });
  //       delete cuadrante._id;
  //       return {
  //         ...cuadrante,
  //         inicio: nuevaFechaInicio.toJSDate(),
  //         final: nuevaFechaFinal.toJSDate(),
  //         enviado: false,
  //       };
  //     });
  //     await this.schCuadrantes.insertCuadrantes(cuadrantesFechasModificadas);
  //   }
  //   return true;
  // }
  // // // Solo para migraciones
  // // async getAllCuadrantes() {
  // //   return await this.schCuadrantes.getAllCuadrantes();
  // // }
  // // async rectificarAllCuadrantes(cuadrantes: TCuadrante[]) {
  // //   return await this.schCuadrantes.rectificarAllCuadrantes(cuadrantes);
  // // }
  // // final de migraciones
}
