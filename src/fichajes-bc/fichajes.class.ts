import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { FichajesDatabase } from "./fichajes.mongodb";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { Trabajador } from "@prisma/client";
import * as moment from "moment";
import { ObjectId, WithId } from "mongodb";
import { FichajeDto, ParFichaje } from "./fichajes.interface";
import { Cuadrantes } from "../cuadrantes/cuadrantes.class";
import { DateTime } from "luxon";

@Injectable()
export class Fichajes {
  constructor(
    private readonly schFichajes: FichajesDatabase,
    private readonly trabajadoresInstance: TrabajadorService,
    private readonly cuadrantesInstance: Cuadrantes,
  ) {}

  async nuevaEntrada(
    trabajador: Trabajador,
    latitud?: number,
    longitud?: number,
  ) {
    const hora = DateTime.now().toJSDate();

    const insert = await this.schFichajes.nuevaEntrada(
      trabajador.idApp,
      hora,
      trabajador.id,
      trabajador.nombreApellidos,
      trabajador.dni,
      latitud,
      longitud,
    );

    if (!insert)
      throw new InternalServerErrorException(
        "No se ha podido registrar la entrada",
      );
  }

  async nuevaSalida(
    trabajador: Trabajador,
    latitud?: number,
    longitud?: number,
  ) {
    const hora = DateTime.now().toJSDate();

    const insert = await this.schFichajes.nuevaSalida(
      trabajador.idApp,
      hora,
      trabajador.id,
      trabajador.nombreApellidos,
      trabajador.dni,
      latitud,
      longitud,
    );

    if (!insert)
      throw new InternalServerErrorException(
        "No se ha podido registrar la salida",
      );
  }

  async getInicioFichaje(
    horaInicioDescanso: DateTime,
    uid: string,
  ): Promise<DateTime> {
    const fichajesRecientes = await this.getFichajesByUidInverso(
      uid,
      horaInicioDescanso.minus({ hours: 8 }).toJSDate(),
      horaInicioDescanso.toJSDate(),
    );

    for (let i = 0; i < fichajesRecientes.length; i += 1) {
      if (fichajesRecientes[i].tipo === "ENTRADA") {
        return DateTime.fromJSDate(fichajesRecientes[i].hora);
      }
    }

    throw new InternalServerErrorException(
      "No hay ningún fichaje de entrada reciente",
    );
  }

  async nuevoInicioDescanso(trabajador: Trabajador) {
    const hora = DateTime.now();

    const insert = await this.schFichajes.nuevoInicioDescanso(
      trabajador.idApp,
      hora.toJSDate(),
      trabajador.id,
      trabajador.nombreApellidos,
      trabajador.dni,
    );

    if (!insert)
      throw new InternalServerErrorException(
        "No se ha podido registrar el inicio del descanso",
      );
    return hora;
  }

  async nuevoFinalDescanso(trabajador: Trabajador) {
    const hora = DateTime.now().toJSDate();

    const insert = await this.schFichajes.nuevoFinalDescanso(
      trabajador.idApp,
      hora,
      trabajador.id,
      trabajador.nombreApellidos,
      trabajador.dni,
    );

    if (!insert)
      throw new InternalServerErrorException(
        "No se ha podido registrar el inicio del descanso",
      );
  }

  async getEstado(uid: string, fecha: Date) {
    const fichajes = await this.schFichajes.getFichajesDia(uid, fecha);
    const ultimoFichaje = fichajes[fichajes.length - 1];
    const ultimaEntrada = fichajes.find(
      (fichaje) => fichaje.tipo === "ENTRADA",
    );

    if (!ultimoFichaje) {
      return {
        estado: "SIN_ENTRADA",
        entrada: ultimaEntrada
          ? DateTime.fromJSDate(ultimaEntrada.hora).toISO()
          : null,
        ultimoFichaje: ultimoFichaje
          ? DateTime.fromJSDate(ultimoFichaje.hora).toISO()
          : null,
      };
    } else if (
      ultimoFichaje.tipo === "ENTRADA" ||
      ultimoFichaje.tipo === "FINAL_DESCANSO"
    ) {
      return {
        estado: "TRABAJANDO",
        entrada: ultimaEntrada
          ? DateTime.fromJSDate(ultimaEntrada.hora).toISO()
          : null,
        ultimoFichaje: ultimoFichaje
          ? DateTime.fromJSDate(ultimoFichaje.hora).toISO()
          : null,
      };
    } else if (ultimoFichaje.tipo === "SALIDA") {
      return {
        estado: "HA_SALIDO",
        entrada: ultimaEntrada
          ? DateTime.fromJSDate(ultimaEntrada.hora).toISO()
          : null,
        ultimoFichaje: ultimoFichaje
          ? DateTime.fromJSDate(ultimoFichaje.hora).toISO()
          : null,
      };
    } else if (ultimoFichaje.tipo === "INICIO_DESCANSO") {
      return {
        estado: "DESCANSANDO",
        entrada: ultimaEntrada
          ? DateTime.fromJSDate(ultimaEntrada.hora).toISO()
          : null,
        ultimoFichaje: ultimoFichaje
          ? DateTime.fromJSDate(ultimoFichaje.hora).toISO()
          : null,
      };
    } else throw new InternalServerErrorException("Estado no reconocido");
  }

  async getTiempoDescansoTotalDia(
    inicio: DateTime,
    final: DateTime,
    uid: string,
  ) {
    const descansos = await this.schFichajes.getDescansosTrabajadorDia(
      inicio,
      final,
      uid,
    );

    let totalTiempoDescanso = 0; // Inicializamos el contador de tiempo total de descanso

    for (let i = 0; i < descansos.length - 1; i++) {
      if (descansos[i].tipo === "INICIO_DESCANSO") {
        const inicioDescanso = DateTime.fromJSDate(descansos[i].hora);

        // Inicializa finalDescanso como undefined
        let finalDescanso: DateTime | null;

        // Busca el correspondiente FIN_DESCANSO
        for (let j = i + 1; j < descansos.length; j++) {
          if (descansos[j].tipo === "FINAL_DESCANSO") {
            finalDescanso = DateTime.fromJSDate(descansos[j].hora);
            i = j;
            break; // Rompe el bucle una vez que encuentres el fin del descanso
          }
        }

        if (finalDescanso) {
          totalTiempoDescanso += Math.abs(
            finalDescanso.diff(inicioDescanso, "hours").hours,
          );
        }
      }
    }
    return totalTiempoDescanso;
  }

  async sincroFichajes() {
    const fichajesPendientes = await this.schFichajes.getFichajesSincro();
    return await this.schFichajes.enviarFichajesBC(fichajesPendientes);
  }

  filtrarUidFichajeTrabajador(fichajeHit: any, trabajadores: Trabajador[]) {
    for (let i = 0; i < trabajadores.length; i += 1) {
      if (trabajadores[i].id === Number(fichajeHit.usuari))
        return trabajadores[i].idApp ? trabajadores[i].idApp : "NO_TIENE_APP";
    }

    return "NO_TIENE_APP";
  }

  async fusionarFichajesBC() {
    const fichajesBC = await this.schFichajes.getFichajesBC();

    const trabajadores = await this.trabajadoresInstance.getTrabajadores();
    const fichajesPretty = [];

    for (let i = 0; i < fichajesBC.length; i += 1) {
      const idApp = this.filtrarUidFichajeTrabajador(
        fichajesBC[i],
        trabajadores,
      );
      if (idApp === "NO_TIENE_APP") continue;

      if (fichajesBC[i].accio === 1) {
        fichajesPretty.push({
          _id: fichajesBC[i].idr,
          hora: DateTime.fromJSDate(new Date(fichajesBC[i].tmst)).minus({
            hours: 1,
          }),
          uid: idApp,
          tipo: "ENTRADA",
          enviado: true,
          idExterno: Number(fichajesBC[i].usuari),
          comentario: fichajesBC[i].comentari,
          validado: false,
          dni: fichajesBC[i].dni,
          nombre: fichajesBC[i].nombre,
        });
      } else if (fichajesBC[i].accio === 2) {
        fichajesPretty.push({
          _id: fichajesBC[i].idr,
          hora: DateTime.fromJSDate(new Date(fichajesBC[i].tmst)).minus({
            hours: 1,
          }),
          uid: idApp,
          tipo: "SALIDA",
          enviado: true,
          idExterno: Number(fichajesBC[i].usuari),
          comentario: fichajesBC[i].comentari,
          validado: false,
          dni: fichajesBC[i].dni,
          nombre: fichajesBC[i].nombre,
        });
      }
    }

    if (fichajesPretty.length > 0) {
      await this.schFichajes.insertarFichajesHit(fichajesPretty);
      return {
        message: `${fichajesPretty.length} fichajes sincronizado de BC a la app`,
      };
    } else return "No hay fichajes que extraer";
  }

  async getNominas() {
    return await this.schFichajes.getNominas();
  }

  async getFichajesByIdSql(idSql: number, validado: boolean) {
    return this.schFichajes.getFichajesByIdSql(idSql, validado);
  }

  async getFichajesByUid(uid: string, fechaInicio: Date, fechaFinal: Date) {
    return await this.schFichajes.getFichajesByUid(
      uid,
      fechaInicio,
      fechaFinal,
    );
  }

  async getFichajesByUidInverso(
    uid: string,
    fechaInicio: Date,
    fechaFinal: Date,
  ) {
    return await this.schFichajes.getFichajesByUidInverso(
      uid,
      fechaInicio,
      fechaFinal,
    );
  }

  async updateFichaje(id: string, validado: boolean) {
    if (typeof id === "string") console.log(id + " - " + validado);

    return await this.schFichajes.updateFichaje(id, validado);
  }

  // Precondiciones fichajesTrabajador debe estar ordenado por fecha de forma ascendente.
  private comprobarParesFichajes(fichajesTrabajador: WithId<FichajeDto>[]) {
    const primeraEntrada = fichajesTrabajador.findIndex(
      (fichaje) => fichaje.tipo === "ENTRADA",
    );
    const fichajeListFaltan: WithId<FichajeDto>[] = [];

    if (typeof primeraEntrada === "undefined" || primeraEntrada === -1)
      return [];

    for (let i = primeraEntrada; i < fichajesTrabajador.length; i += 1) {
      if (
        fichajesTrabajador[i].tipo === "ENTRADA" &&
        fichajesTrabajador[i + 1]?.tipo === "ENTRADA"
      ) {
        fichajeListFaltan.push(fichajesTrabajador[i]);
      }

      if (
        i === fichajesTrabajador.length - 1 &&
        fichajesTrabajador[i].tipo === "ENTRADA"
      ) {
        fichajeListFaltan.push(fichajesTrabajador[i]);
      }
    }

    return fichajeListFaltan;
  }

  /* Porque hay gente que se olvida de fichar. No se guarda en BBDD, debería guardarse !!! */
  private async createFichajeSalidaSistema(
    diaEntrada: DateTime,
    idTrabajador: number,
  ): Promise<WithId<FichajeDto>> {
    const prediction = await this.getEntradaSalidaPredict(
      idTrabajador,
      diaEntrada,
    );
    const trabajador = await this.trabajadoresInstance.getTrabajadorBySqlId(
      idTrabajador,
    );

    return {
      _id: new ObjectId(),
      enviado: true,
      hora: prediction.salida.toJSDate(),
      idExterno: null,
      tipo: "SALIDA",
      validado: false,
      idTrabajador: idTrabajador,
      uid: trabajador.idApp,
      nombre: trabajador.nombreApellidos,
      dni: trabajador.dni,
    };
  }

  private async getEntradaSalidaPredict(
    idTrabajador: number,
    diaEntrada: DateTime,
  ) {
    const cuadrantes = await this.cuadrantesInstance.getCuadrantesIndividual(
      idTrabajador,
      diaEntrada.startOf("day"),
      diaEntrada.endOf("day"),
    );

    if (cuadrantes.length > 0) {
      let entrada = DateTime.fromJSDate(cuadrantes[0].inicio);
      let salida = DateTime.fromJSDate(cuadrantes[0].final);
      const diferencia = entrada.diff(salida, "minutes").minutes;

      if (diferencia === 0) {
        salida = salida.endOf("day");
      }

      return {
        entrada: entrada,
        salida: salida,
      };
    } else
      return {
        entrada: diaEntrada.startOf("day"),
        salida: diaEntrada.endOf("day"),
      };
  }

  ordenarPorHora(arrayFichajes: WithId<FichajeDto>[]) {
    return arrayFichajes.sort((a, b) => {
      if (a.hora < b.hora) return -1;
      if (a.hora > b.hora) return 1;
      return 0;
    });
  }

  async getParesSinValidar(
    arraySubordinados: Trabajador[],
  ): Promise<ParFichaje[]> {
    const paresSinValidar: ParFichaje[] = [];

    for (const subordinado of arraySubordinados) {
      const susFichajes = await this.getFichajesByIdSql(subordinado.id, false);
      const susFichajesPlus: WithId<FichajeDto>[] = susFichajes.map(
        (fichaje) => ({
          ...fichaje,
          idTrabajador: subordinado.id,
        }),
      );

      this.ordenarPorHora(susFichajesPlus);
      const resPares = await this.obtenerParesTrabajador(susFichajesPlus);
      paresSinValidar.push(...resPares);
    }

    return paresSinValidar;
  }

  /* De momento comprobará la salida en el mismo día. Más adelante se buscará según el cuadrante. */
  private async buscarSalida(
    horaEntrada: DateTime,
    subFichajesSimples: WithId<FichajeDto>[],
  ) {
    for (let i = 0; i < subFichajesSimples.length; i += 1) {
      if (
        subFichajesSimples[i].tipo === "SALIDA" &&
        DateTime.fromJSDate(subFichajesSimples[i].hora) > horaEntrada
      ) {
        const horaSalida = DateTime.fromJSDate(subFichajesSimples[i].hora);
        if (
          horaEntrada.year === horaSalida.year &&
          horaEntrada.month === horaSalida.month &&
          horaEntrada.day === horaSalida.day
        ) {
          return subFichajesSimples[i];
        }
      }
    }
    return null;
  }

  async obtenerParesTrabajador(fichajesSimples: WithId<FichajeDto>[]) {
    this.ordenarPorHora(fichajesSimples);

    const pares: ParFichaje[] = [];

    for (let i = 0; i < fichajesSimples.length; i += 1) {
      if (fichajesSimples[i].tipo === "ENTRADA") {
        const dataSalidaEncontrada = await this.buscarSalida(
          DateTime.fromJSDate(fichajesSimples[i].hora),
          fichajesSimples,
        );

        if (dataSalidaEncontrada) {
          pares.push({
            entrada: fichajesSimples[i],
            salida: dataSalidaEncontrada,
            cuadrante: await this.cuadrantesInstance.getTurnoDia(
              fichajesSimples[i].idTrabajador,
              DateTime.fromJSDate(fichajesSimples[i].hora),
            ),
          });
        } else {
          const cuadrante = await this.cuadrantesInstance.getTurnoDia(
            fichajesSimples[i].idTrabajador,
            DateTime.fromJSDate(fichajesSimples[i].hora),
          );
          pares.push({
            entrada: fichajesSimples[i],
            salida: {
              _id: new ObjectId(),
              hora: DateTime.fromJSDate(cuadrante.final).toJSDate(),
              idTrabajador: fichajesSimples[i].idTrabajador,
              tipo: "SALIDA",
              validado: false,
              uid: fichajesSimples[i].uid,
              nombre: fichajesSimples[i].nombre,
              dni: fichajesSimples[i].dni,
              enviado: false,
              idExterno: fichajesSimples[i].idTrabajador,
              salidaAutomatica: true,
            },
            cuadrante: cuadrante,
          });
        }
      }
    }
    return pares;
  }

  async hayFichajesPendientes(ids: number[], fecha: DateTime) {
    console.log("Entro causa");

    const lunes = fecha.startOf("week");
    // const ids: number[] = [3608, 5740, 975];

    // const subordinados = await this.trabajadoresInstance.getSubordinadosByIdsql(usuarioRequest.id);
    const arrayCaritas: boolean[] = [true, true, true, true, true, true, true];

    for (let i = 0; i < ids.length; i += 1) {
      for (let j = 0; j < 7; j += 1) {
        const resultado = await this.schFichajes.getPendientesTrabajadorDia(
          ids[i],
          lunes.plus({ days: j }),
        );
        if (resultado) {
          if (!resultado.validado) {
            arrayCaritas[j] = false;
          }
        }
      }
    }
    return arrayCaritas;
  }

  // Solo para propósito de rectificación general
  async getAllFichajes() {
    return await this.schFichajes.getAllFichajes();
  }
  // Solo para propósito de rectificación general
  async setAllFichajes(fichajes: WithId<FichajeDto>[]) {
    return await this.schFichajes.setAllFichajes(fichajes);
  }

  async validarFichajesAntiguos() {
    //Fechas a reiniciar
    const ahora = DateTime.now();
    const inicioSemanaActual = ahora.startOf("week");
    const inicioSemanaAnterior = inicioSemanaActual.minus({ weeks: 1 });

    console.log(inicioSemanaActual);
    console.log(inicioSemanaAnterior);

    const response =
      this.schFichajes.validarFichajesAntiguos(inicioSemanaAnterior);

    console.log(response);

    return response;
  }

  async getFichajes(idSql: number) {
    return this.schFichajes.getFichajes(idSql);
  }
}
