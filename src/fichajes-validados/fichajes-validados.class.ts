import { Injectable } from "@nestjs/common";
import { FichajeValidadoDto } from "./fichajes-validados.interface";
import { FichajesValidadosDatabase } from "./fichajes-validados.mongodb";
import { Trabajador } from "../trabajadores/trabajadores.class";
import { TrabajadorCompleto } from "../trabajadores/trabajadores.interface";
import * as moment from "moment";
import { WithId } from "mongodb";
import { DateTime } from "luxon";

@Injectable()
export class FichajesValidados {
  constructor(
    private readonly schFichajesValidados: FichajesValidadosDatabase,
    private readonly trabajadoresInstance: Trabajador,
  ) {}

  async addFichajesValidados(fichajeValidado: FichajeValidadoDto) {
    return await this.schFichajesValidados.insertarFichajeValidado(
      fichajeValidado,
    );
  }

  async getFichajesValidados(idTrabajador: number) {
    return await this.schFichajesValidados.getFichajesValidados(idTrabajador);
  }
  async updateFichajesValidados(fichajesValidados: FichajeValidadoDto) {
    return await this.schFichajesValidados.updateFichajesValidados(
      fichajesValidados,
    );
  }

  async getFichajesPagar(idResponsable: number, aPagar: boolean) {
    return await this.schFichajesValidados.getFichajesPagar(
      idResponsable,
      aPagar,
    );
  }

  async getAllFichajesPagar(aPagar: boolean) {
    return await this.schFichajesValidados.getAllFichajesPagar(aPagar);
  }

  async getAllIdResponsable(idResponsable: number) {
    return await this.schFichajesValidados.getAllIdResponsableFichajesPagar(
      idResponsable,
    );
  }

  async getSemanasFichajesPagar(semana: number) {
    return await this.schFichajesValidados.getSemanasFichajesPagar(semana);
  }

  async getAllFichajesValidados() {
    return await this.schFichajesValidados.getAllFichajesValidados();
  }

  // Cuadrantes 2.0
  async getParaCuadrante(
    lunes: DateTime,
    domingo: DateTime,
    idTrabajador: number,
  ) {
    return await this.schFichajesValidados.getParaCuadrante(
      lunes,
      domingo,
      idTrabajador,
    );
  }

  // Cuadrantes 2.0
  async resumenSemana(fechaBusqueda: Date, idTienda: number) {
    const lunes = DateTime.fromJSDate(fechaBusqueda).startOf("week");
    const responsable: TrabajadorCompleto =
      await this.trabajadoresInstance.getResponsableTienda(idTienda);
    const subordinados = await this.trabajadoresInstance.getSubordinadosById(
      responsable.id,
    );
    const arrayValidados =
      await this.schFichajesValidados.getValidadosSemanaResponsable(
        lunes,
        lunes.endOf("week"),
        responsable.id,
      );

    for (let i = 0; i < subordinados.length; i += 1) {
      subordinados[i]["fichajeValidado"] = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ];
    }

    for (let i = 0; i < arrayValidados.length; i += 1) {
      const dayIndex =
        DateTime.fromJSDate(arrayValidados[i].fechaEntrada).weekday - 1;
      this.addToSubordinados(subordinados, arrayValidados[i], dayIndex);
    }

    return subordinados; // Hacer map para filtrar datos innecesarios.
  }

  // Cuadrantes 2.0
  addToSubordinados(
    subordinados: {
      id: number;
      idApp: string;
      nombreApellidos: string;
      idTienda: number;
      antiguedad: string;
      inicioContrato: string;
      horasContrato: number;
      fichajeValidado?: FichajeValidadoDto;
    }[],
    fichajeValidado: WithId<FichajeValidadoDto>,
    dayIndex: number,
  ) {
    for (let i = 0; i < subordinados.length; i += 1) {
      if (subordinados[i].id === fichajeValidado.idTrabajador) {
        subordinados[i].fichajeValidado[dayIndex] = fichajeValidado;
        break;
      }
    }
  }
}
