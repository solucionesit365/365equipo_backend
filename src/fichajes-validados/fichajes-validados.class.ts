import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { FichajesValidadosDatabase } from "./fichajes-validados.mongodb";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { WithId } from "mongodb";
import { DateTime } from "luxon";
import { FichajeValidadoDto } from "./fichajes-validados.dto";
import { Trabajador } from "@prisma/client";

@Injectable()
export class FichajesValidadosService {
  constructor(
    private readonly schFichajesValidados: FichajesValidadosDatabase,
    @Inject(forwardRef(() => TrabajadorService))
    private readonly trabajadoresInstance: TrabajadorService,
  ) {}

  async addFichajesValidados(fichajeValidado: FichajeValidadoDto) {
    return await this.schFichajesValidados.insertarFichajeValidado(
      fichajeValidado,
    );
  }

  async getFichajesValidados(idTrabajador: number) {
    return await this.schFichajesValidados.getFichajesValidados(idTrabajador);
  }

  async getFichajesValidadosRango(
    idTrabajador: number,
    fechaInicio: DateTime,
    fechaFinal: DateTime,
  ) {
    return await this.schFichajesValidados.getParaCuadranteNew(
      fechaInicio,
      fechaFinal,
      idTrabajador,
    );
  }

  async getPendientesEnvio() {
    return await this.schFichajesValidados.getPendientesEnvio();
  }

  async insertFichajesValidadosRectificados(data: FichajeValidadoDto[]) {
    return await this.schFichajesValidados.insertFichajesValidadosRectificados(
      data,
    );
  }

  formatoConsultaSQL(fichaje: FichajeValidadoDto): string {
    // const idPlan = fichaje.cuadrante.idPlan;
    // const horasExtra = fichaje.horasExtra ? fichaje.horasExtra : 0;
    // const horasCoordinacion = fichaje.horasCoordinacion
    //   ? fichaje.horasCoordinacion
    //   : 0;
    // const horasAprendiz = fichaje.horasAprendiz ? fichaje.horasAprendiz : 0;
    const idEmpleado = fichaje.idTrabajador;
    // Convertir a estándard con tipo Date.
    const fecha = DateTime.fromJSDate(fichaje.cuadrante.inicio);
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

  async getFichajesPagar(
    idResponsable: number,
    aPagar: boolean,
    fecha: DateTime,
  ) {
    return await this.schFichajesValidados.getFichajesPagar(
      idResponsable,
      aPagar,
      fecha,
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

  async getSemanasFichajesPagar(fechaEntreSemana: DateTime) {
    const fechaInicio = fechaEntreSemana.startOf("week");
    const fechaFinal = fechaEntreSemana.endOf("week");
    return await this.schFichajesValidados.getSemanasFichajesPagar(
      fechaInicio,
      fechaFinal,
    );
  }

  async getAllFichajesValidados(fecha: Date) {
    return await this.schFichajesValidados.getAllFichajesValidados(
      DateTime.fromJSDate(fecha),
    );
  }

  async getParaCuadrante(
    fechaInicio: DateTime,
    fechaFinal: DateTime,
    idTrabajador: number,
  ) {
    return await this.schFichajesValidados.getParaCuadrante(
      fechaInicio,
      fechaFinal,
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
  async getTiendaDia(tienda: number, dia: Date) {
    return await this.schFichajesValidados.getTiendaDia(
      tienda,
      DateTime.fromJSDate(dia),
    );
  }

  async resumenSemana(fecha: Date, idTienda: number) {
    const lunes = DateTime.fromJSDate(fecha).startOf("week");
    const domingo = DateTime.fromJSDate(fecha).endOf("week");
    const responsable: Trabajador =
      await this.trabajadoresInstance.getResponsableTienda(idTienda);
    const subordinados = await this.trabajadoresInstance.getSubordinadosById(
      responsable.id,
    );
    const arrayValidados =
      await this.schFichajesValidados.getValidadosSemanaResponsable(
        lunes,
        domingo,
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
      this.getNumeroSemana(arrayValidados[i].cuadrante.inicio);
      // this.addToSubordinados(subordinados, arrayValidados[i], dayIndex);
    }
    return subordinados; // Hacer map para filtrar datos innecesarios.
  }

  getNumeroSemana(fecha: Date) {
    const date = DateTime.fromJSDate(fecha);
    const dayOfWeek = (date.weekday + 6) % 7;
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

  async getFichajesValidadosTiendaRango(
    idTienda: number,
    fechaInicio: DateTime,
    fechaFinal: DateTime,
  ) {
    return await this.schFichajesValidados.getFichajesValidadosTiendaRango(
      idTienda,
      fechaInicio,
      fechaFinal,
    );
  }

  async getFichajesValidadosTrabajadorTiendaRango(
    idTrabajador: number,
    idTienda: number,
    fechaInicio: DateTime,
    fechaFinal: DateTime,
  ) {
    const resFichajesValidados =
      await this.schFichajesValidados.getFichajesValidadosTrabajadorTiendaRango(
        idTrabajador,
        idTienda,
        fechaInicio,
        fechaFinal,
      );

    return resFichajesValidados;
  }

  //Para informe de Kathy
  async getFichajesValidadosInforme(
    fechaInicio: DateTime,
    fechaFinal: DateTime,
    idTrabajador: number,
  ) {
    const resFichajesValidados =
      await this.schFichajesValidados.getFichajesValidadosInforme(
        fechaInicio,
        fechaFinal,
        idTrabajador,
      );

    return resFichajesValidados;
  }

  // Solo se usa para el test de rectificarFichajesValidados
  async getTodos() {
    return await this.schFichajesValidados.getTodos();
  }
}
