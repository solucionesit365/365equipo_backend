import { Injectable } from "@nestjs/common";
import { IGenerarParesFichajeUseCase } from "./IGenerarParesFichaje.use-case";
import { ParFichaje } from "@prisma/client";
import { DateTime } from "luxon";
import { IFichajeRepository } from "../../fichajes-bc/repository/IFichaje.repository";
import { FichajeDto } from "../../fichajes-bc/fichajes.interface";
import { ObjectId, WithId } from "mongodb";

@Injectable()
export class GenerarParesFichajeUseCase implements IGenerarParesFichajeUseCase {
  constructor(private readonly fichajeRepository: IFichajeRepository) {}

  async execute(): Promise<ParFichaje[]> {
    // 1. Obtener hoy al inicio del día o más antiguos (máximo 2 días)
    const hoy = DateTime.now().startOf("day");
    const haceDosDias = hoy.minus({ days: 2 });

    const fichajesSimples = await this.fichajeRepository.getFichajes(
      hoy,
      haceDosDias,
    );

    // 2. Recorrer en busca de los pares.
  }

  private async obtenerParesTrabajador(fichajesSimples: WithId<FichajeDto>[]) {
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
            cuadrante: await this.getTurnoDelDiaUseCase.execute(
              fichajesSimples[i].idTrabajador,
              DateTime.fromJSDate(fichajesSimples[i].hora),
            ),
          });
        } else {
          const cuadrante = await this.getTurnoDelDiaUseCase.execute(
            fichajesSimples[i].idTrabajador,
            DateTime.fromJSDate(fichajesSimples[i].hora),
          );

          if (
            cuadrante &&
            cuadrante.final &&
            DateTime.fromJSDate(cuadrante.final).isValid
          ) {
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
    }
    return pares;
  }

  private ordenarPorHora(arrayFichajes: WithId<FichajeDto>[]) {
    return arrayFichajes.sort((a, b) => {
      if (a.hora < b.hora) return -1;
      if (a.hora > b.hora) return 1;
      return 0;
    });
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
}
