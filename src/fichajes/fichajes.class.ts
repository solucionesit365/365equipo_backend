import { Injectable } from "@nestjs/common";
import { FichajesDatabase } from "./fichajes.mongodb";
import { Trabajador } from "../trabajadores/trabajadores.class";
import {
  Subordinado,
  TrabajadorSql,
} from "../trabajadores/trabajadores.interface";
import * as moment from "moment";
import { ObjectId, WithId } from "mongodb";
import { FichajeDto, ParFichaje } from "./fichajes.interface";
import { FichajeValidadoDto } from "../fichajes-validados/fichajes-validados.interface";
import { Cuadrantes } from "../cuadrantes/cuadrantes.class";
import { DateTime } from "luxon";

@Injectable()
export class Fichajes {
  constructor(
    private readonly schFichajes: FichajesDatabase,
    private readonly trabajadoresInstance: Trabajador,
    private readonly cuadrantesInstance: Cuadrantes,
  ) {}

  async nuevaEntrada(uid: string) {
    const hora = new Date();
    const trabajadorCompleto =
      await this.trabajadoresInstance.getTrabajadorByAppId(uid);
    const insert = await this.schFichajes.nuevaEntrada(
      uid,
      hora,
      trabajadorCompleto.id,
    );

    if (insert) return true;

    throw Error("No se ha podido registrar la entrada");
  }

  async nuevaSalida(uid: string) {
    const hora = new Date();
    const trabajadorCompleto =
      await this.trabajadoresInstance.getTrabajadorByAppId(uid);
    const insert = await this.schFichajes.nuevaSalida(
      uid,
      hora,
      trabajadorCompleto.id,
    );

    if (insert) return true;

    throw Error("No se ha podido registrar la salida");
  }

  async getEstado(uid: string, fecha: Date) {
    const fichajes = await this.schFichajes.getFichajesDia(uid, fecha);
    const primerFichaje = fichajes[0];
    const ultimoFichaje = fichajes[fichajes.length - 1];

    if (!ultimoFichaje) {
      return "SIN_ENTRADA";
    } else if (primerFichaje.tipo === "SALIDA") {
      return "ERROR";
    } else if (ultimoFichaje.tipo === "ENTRADA") {
      return {
        estado: "TRABAJANDO",
        data: ultimoFichaje,
      };
    } else if (ultimoFichaje.tipo === "SALIDA") {
      return "HA_SALIDO";
    } else return "ERROR";
  }

  async sincroFichajes() {
    const fichajesPendientes = await this.schFichajes.getFichajesSincro();
    await this.schFichajes.enviarHit(fichajesPendientes);
  }

  filtrarUidFichajeTrabajador(fichajeHit: any, trabajadores: TrabajadorSql[]) {
    for (let i = 0; i < trabajadores.length; i += 1) {
      if (trabajadores[i].id === Number(fichajeHit.usuari))
        return trabajadores[i].idApp ? trabajadores[i].idApp : "NO_TIENE_APP";
    }

    return "NO_TIENE_APP";
  }

  async fusionarFichajesHit() {
    const fichajesHit = await this.schFichajes.getFichajesHit();
    const trabajadores = await this.trabajadoresInstance.getTrabajadores();
    const fichajesPretty = [];

    for (let i = 0; i < fichajesHit.length; i += 1) {
      const idApp = this.filtrarUidFichajeTrabajador(
        fichajesHit[i],
        trabajadores,
      );
      if (idApp === "NO_TIENE_APP") continue;

      if (fichajesHit[i].accio === 1) {
        fichajesPretty.push({
          _id: fichajesHit[i].idr,
          hora: moment(fichajesHit[i].tmst).toDate(),
          uid: idApp,
          tipo: "ENTRADA",
          enviado: true,
          idExterno: Number(fichajesHit[i].usuari),
          comentario: fichajesHit[i].comentario,
          validado: false,
        });
      } else if (fichajesHit[i].accio === 2) {
        fichajesPretty.push({
          _id: fichajesHit[i].idr,
          hora: moment(fichajesHit[i].tmst).toDate(),
          uid: idApp,
          tipo: "SALIDA",
          enviado: true,
          idExterno: Number(fichajesHit[i].usuari),
          comentario: fichajesHit[i].comentario,
          validado: false,
        });
      }
    }

    await this.schFichajes.insertarFichajesHit(fichajesPretty);

    return true;
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

  async updateFichaje(id: string, validado: boolean) {
    if (typeof id === "string") console.log(id + " - " + validado);

    return await this.schFichajes.updateFichaje(id, validado);
  }

  // Precondiciones fichajesTrabajador debe estar ordenado por fecha de forma ascendente.
  private comprobarParesFichajes(fichajesTrabajador: WithId<FichajeDto>[]) {
    const primeraEntrada = fichajesTrabajador.findIndex(
      (fichaje) => fichaje.tipo === "ENTRADA",
    );
    const indexList: number[] = [];

    if (typeof primeraEntrada === "undefined") return [];

    for (let i = primeraEntrada; i < fichajesTrabajador.length; i += 1) {
      if (
        fichajesTrabajador[i].tipo === "ENTRADA" &&
        fichajesTrabajador[i + 1]?.tipo === "ENTRADA"
      ) {
        indexList.push(i);
      }

      if (
        i === fichajesTrabajador.length - 1 &&
        fichajesTrabajador[i].tipo === "ENTRADA"
      ) {
        indexList.push(i);
      }
    }

    indexList.sort((a, b) => b - a);
    return indexList;
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

    if (cuadrantes.length > 0)
      return {
        entrada: DateTime.fromJSDate(cuadrantes[0].inicio),
        salida: DateTime.fromJSDate(cuadrantes[0].final),
      };
    else
      return {
        entrada: diaEntrada.startOf("day"),
        salida: diaEntrada.endOf("day"),
      };
  }

  async getParesSinValidar(
    arraySubordinados: Subordinado[],
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

      const indexList = this.comprobarParesFichajes(susFichajesPlus);

      // Si hay al menos un índice, hay que agregarlo al array de fichajes.
      for (let j = 0; j < indexList.length; j += 1) {
        const fichajeSistema = await this.createFichajeSalidaSistema(
          DateTime.fromJSDate(susFichajesPlus[j].hora),
          susFichajesPlus[j].idTrabajador,
        );
        susFichajesPlus.splice(j + 1, 0, fichajeSistema);
      }

      const resPares = this.obtenerParesTrabajador(susFichajesPlus);
      paresSinValidar.push(...resPares);
    }

    return paresSinValidar;
  }

  private obtenerParesTrabajador(fichajesSimples: WithId<FichajeDto>[]) {
    const pares: ParFichaje[] = [];

    if (fichajesSimples.length % 2 === 0) {
      for (let i = 0; i < fichajesSimples.length; i += 2) {
        if (
          fichajesSimples[i].tipo === "ENTRADA" &&
          fichajesSimples[i + 1].tipo === "SALIDA"
        ) {
          pares.push({
            entrada: fichajesSimples[i],
            salida: fichajesSimples[i + 1],
          });
        }
      }
    } else throw Error("No se podrán conseguir los pares de una lista impar");
    return pares;
  }

  // private async transformarFichajesSinValidar(
  //   fichajesPdtesDesordenados: WithId<FichajeDto>[],
  //   idResponsable: number,
  // ) {
  //   const fichajesTransformados: FichajeValidadoDto[] = [];

  //   for (const fichaje of fichajesPdtesDesordenados) {
  //     const data: FichajeValidadoDto = {
  //       aPagar: false,
  //       comentario: { entrada: "", salida: "" },
  //       enviado: false,
  //       horasAprendiz: 0,
  //       horasCoordinacion: 0,
  //       horasExtra: 0,
  //       horasPagar: {
  //         comentario: "",
  //         estadoValidado: "",
  //         respSuper: "",
  //         total: 0,
  //       },
  //       idResponsable,
  //       idTrabajador: fichaje.idTrabajador,
  //       fecha: fichaje.hora.toISOString(),
  //     };

  //     fichajesTransformados.push();
  //   }
  // }
}
