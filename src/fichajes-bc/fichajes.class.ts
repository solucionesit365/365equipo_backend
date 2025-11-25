import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { FichajesDatabase } from "./fichajes.mongodb";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { Trabajador } from "@prisma/client";
import { ObjectId, WithId } from "mongodb";
import { FichajeDto, ParFichaje } from "./fichajes.interface";
import { Cuadrantes } from "../cuadrantes/cuadrantes.class";
import { DateTime } from "luxon";
import { ITurnoRepository } from "../turno/repository/interfaces/turno.repository.interface";
import { IGetTurnoDelDiaUseCase } from "../turno/use-cases/interfaces/IGetTurnoDelDia.use-case";

@Injectable()
export class Fichajes {
  constructor(
    private readonly schFichajes: FichajesDatabase,
    private readonly trabajadoresInstance: TrabajadorService,
    private readonly turnoRepository: ITurnoRepository,
    private readonly getTurnoDelDiaUseCase: IGetTurnoDelDiaUseCase,
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
      // if (idApp === "NO_TIENE_APP") continue; //se quita por que no entraban los fichajes de las dependientas que no tienen la app cuando la tengan se actualiza el idApp

      if (fichajesBC[i].accio === 1) {
        fichajesPretty.push({
          _id: fichajesBC[i].idr,
          hora: DateTime.fromJSDate(new Date(fichajesBC[i].tmst)),
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
          hora: DateTime.fromJSDate(new Date(fichajesBC[i].tmst)),
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
    const trabajador =
      await this.trabajadoresInstance.getTrabajadorBySqlId(idTrabajador);

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
    const cuadrantes = await this.turnoRepository.getTurnosPorTrabajador(
      idTrabajador,
      diaEntrada.startOf("day"),
    );

    if (cuadrantes.length > 0) {
      const entrada = DateTime.fromJSDate(cuadrantes[0].inicio);
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
    idTienda?: number,
  ): Promise<ParFichaje[]> {
    const paresSinValidar: ParFichaje[] = [];
    const idsSubordinados = new Set(arraySubordinados.map((s) => s.id));
    const trabajadoresProcesados = new Set<number>();

    // Procesar subordinados directos EN PARALELO
    const fichajesSubordinadosPromises = arraySubordinados.map(
      async (subordinado) => {
        const susFichajes = await this.getFichajesByIdSql(subordinado.id, false);
        return {
          idTrabajador: subordinado.id,
          fichajes: susFichajes.map((fichaje) => ({
            ...fichaje,
            idTrabajador: subordinado.id,
          })),
        };
      },
    );

    const fichajesSubordinados = await Promise.all(fichajesSubordinadosPromises);

    // Procesar pares de cada subordinado EN PARALELO
    const paresSubordinadosPromises = fichajesSubordinados.map(
      async ({ idTrabajador, fichajes }) => {
        this.ordenarPorHora(fichajes);
        trabajadoresProcesados.add(idTrabajador);
        return this.obtenerParesTrabajador(fichajes);
      },
    );

    const paresSubordinados = await Promise.all(paresSubordinadosPromises);
    paresSubordinados.forEach((pares) => paresSinValidar.push(...pares));

    // Si se proporciona idTienda, buscar trabajadores externos que hayan trabajado en la tienda
    if (idTienda) {
      // Obtener turnos de la tienda de las últimas 3 semanas EN PARALELO
      const fechaLimite = DateTime.now().minus({ weeks: 3 }).startOf("week");
      const fechaActual = DateTime.now();
      const semanasPromises: Promise<any[]>[] = [];

      let fechaSemana = fechaLimite;
      while (fechaSemana <= fechaActual) {
        semanasPromises.push(
          this.turnoRepository.getTurnosPorTienda(idTienda, fechaSemana),
        );
        fechaSemana = fechaSemana.plus({ weeks: 1 });
      }

      const turnosPorSemana = await Promise.all(semanasPromises);
      const todosTurnos = turnosPorSemana.flat();

      // Extraer IDs únicos de trabajadores que tienen turnos pero no son subordinados
      const idsTrabajadoresExternos = [
        ...new Set(
          todosTurnos
            .map((turno) => turno.idTrabajador)
            .filter(
              (id) =>
                !idsSubordinados.has(id) && !trabajadoresProcesados.has(id),
            ),
        ),
      ];

      // Obtener fichajes de trabajadores externos EN PARALELO
      const fichajesExternosPromises = idsTrabajadoresExternos.map(
        async (idTrabajador) => {
          const fichajes = await this.getFichajesByIdSql(idTrabajador, false);
          return {
            idTrabajador,
            fichajes: fichajes.map((fichaje) => ({
              ...fichaje,
              idTrabajador,
            })),
          };
        },
      );

      const fichajesExternos = await Promise.all(fichajesExternosPromises);

      // Procesar pares de trabajadores externos EN PARALELO
      const paresExternosPromises = fichajesExternos.map(
        async ({ idTrabajador, fichajes }) => {
          this.ordenarPorHora(fichajes);
          trabajadoresProcesados.add(idTrabajador);
          return this.obtenerParesTrabajador(fichajes);
        },
      );

      const paresExternos = await Promise.all(paresExternosPromises);
      paresExternos.forEach((pares) => paresSinValidar.push(...pares));
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

    // Filtrar solo las entradas para pre-cargar turnos
    const entradas = fichajesSimples.filter((f) => f.tipo === "ENTRADA");

    if (entradas.length === 0) {
      return pares;
    }

    // Pre-cargar todos los turnos necesarios EN PARALELO
    const turnosPromises = entradas.map((entrada) =>
      this.getTurnoDelDiaUseCase.execute(
        entrada.idTrabajador,
        DateTime.fromJSDate(entrada.hora),
      ),
    );
    const turnos = await Promise.all(turnosPromises);

    // Crear un mapa de turnos por fecha+idTrabajador para acceso rápido
    const turnosMap = new Map<string, any>();
    entradas.forEach((entrada, index) => {
      const fecha = DateTime.fromJSDate(entrada.hora);
      const key = `${entrada.idTrabajador}-${fecha.toISODate()}`;
      turnosMap.set(key, turnos[index]);
    });

    // Procesar entradas usando los turnos pre-cargados
    for (const entrada of entradas) {
      const horaEntrada = DateTime.fromJSDate(entrada.hora);
      const key = `${entrada.idTrabajador}-${horaEntrada.toISODate()}`;
      const cuadrante = turnosMap.get(key);

      const dataSalidaEncontrada = this.buscarSalidaSync(
        horaEntrada,
        fichajesSimples,
      );

      if (dataSalidaEncontrada) {
        pares.push({
          entrada,
          salida: dataSalidaEncontrada,
          cuadrante,
        });
      } else if (
        cuadrante &&
        cuadrante.final &&
        DateTime.fromJSDate(cuadrante.final).isValid
      ) {
        pares.push({
          entrada,
          salida: {
            _id: new ObjectId(),
            hora: DateTime.fromJSDate(cuadrante.final).toJSDate(),
            idTrabajador: entrada.idTrabajador,
            tipo: "SALIDA",
            validado: false,
            uid: entrada.uid,
            nombre: entrada.nombre,
            dni: entrada.dni,
            enviado: false,
            idExterno: entrada.idTrabajador,
            salidaAutomatica: true,
          },
          cuadrante,
        });
      }
    }
    return pares;
  }

  // Versión síncrona de buscarSalida (no necesita ser async)
  private buscarSalidaSync(
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

  async hayFichajesPendientes(ids: number[], fecha: DateTime) {
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

    const response =
      this.schFichajes.validarFichajesAntiguos(inicioSemanaAnterior);

    return response;
  }

  async getFichajes(idSql: number) {
    return this.schFichajes.getFichajes(idSql);
  }

  private getHoraDiferenciaSpain(): number {
    const dt = DateTime.now();
    const dtMadrid = dt.setZone("Europe/Madrid");
    const isDST = dtMadrid.isInDST;

    return isDST ? 2 : 1;
  }
}
