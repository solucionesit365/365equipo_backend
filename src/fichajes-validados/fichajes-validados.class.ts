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

  async getPendientesEnvio() {
    return await this.schFichajesValidados.getPendientesEnvio();
  }

  formatoConsultaSQL(fichaje: FichajeValidadoDto): string {
    const idPlan = fichaje.cuadrante.idPlan;
    const horasExtra = fichaje.horasExtra ? fichaje.horasExtra : 0;
    const horasCoordinacion = fichaje.horasCoordinacion
      ? fichaje.horasCoordinacion
      : 0;
    const horasAprendiz = fichaje.horasAprendiz ? fichaje.horasAprendiz : 0;
    const idEmpleado = fichaje.idTrabajador;
    // Convertir a estándard con tipo Date.
    const fecha = DateTime.fromFormat(fichaje.fecha, "yyyy-MM-dd");
    const day = fecha.day;
    const month = fecha.month;
    const year = fecha.year;
    const nombreTabla = "";
    return `
    DELETE FROM ${nombreTabla} WHERE idEmpleado = ${idEmpleado} AND ${day} = DAY(fecha) AND ${month} = MONTH(fecha) AND ${year} = YEAR(fecha)  AND (idTurno like '%_Extra%' OR AND idTurno like '%_Coordinacion%' OR AND idTurno like '%_Aprendiz%');
    INSERT INTO ${nombreTabla} (idPlan, fecha, botiga, idTurno, idEmpleado, usuarioModif, fechaModif, activo)
    VALUES (NEWID(), )
    `;
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

  async getAllFichajesValidados(fecha: string) {
    return await this.schFichajesValidados.getAllFichajesValidados(fecha);
  }

  async getParaCuadrante(year: number, semana: number, idTrabajador: number) {
    return await this.schFichajesValidados.getParaCuadrante(
      year,
      semana,
      idTrabajador,
    );
  }

  // Cuadrantes 2.0
  async getParaCuadranteNew(
    lunes: DateTime,
    domingo: DateTime,
    idTrabajador: number,
  ) {
    return await this.schFichajesValidados.getParaCuadranteNew(
      lunes,
      domingo,
      idTrabajador,
    );
  }
  async getTiendaDia(tienda: number, dia: string) {
    return await this.schFichajesValidados.getTiendaDia(tienda, dia);
  }

  async resumenSemana(year: number, semana: number, idTienda: number) {
    const lunes = moment(
      year + "-W" + (semana < 10 ? "0" + semana : semana) + "-1",
    );
    const responsable: TrabajadorCompleto =
      await this.trabajadoresInstance.getResponsableTienda(idTienda);
    const subordinados = await this.trabajadoresInstance.getSubordinadosById(
      responsable.id,
    );
    const arrayValidados =
      await this.schFichajesValidados.getValidadosSemanaResponsable(
        year,
        semana,
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
      const dayIndex = this.getNumeroSemana(arrayValidados[i].fecha);
      // this.addToSubordinados(subordinados, arrayValidados[i], dayIndex);
    }

    return subordinados; // Hacer map para filtrar datos innecesarios.
  }

  getNumeroSemana(stringDate: string) {
    const date = moment(stringDate, "YYYY-MM-DD");
    const dayOfWeek = (date.day() + 6) % 7;
    return dayOfWeek;
  }

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
