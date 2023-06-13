import { Injectable } from "@nestjs/common";
import * as moment from "moment";
import { CuadrantesDatabase } from "./cuadrantes.mongodb";
import { ObjectId } from "mongodb";
import { TCuadrante } from "./cuadrantes.interface";
import { Tienda } from "../tiendas/tiendas.class";
import { FacTenaMssql } from "../bbdd/mssql.class";
import {
  AusenciaInterface,
  TiposAusencia,
} from "../ausencias/ausencias.interface";
import { Trabajador } from "../trabajadores/trabajadores.class";
import { TrabajadorSql } from "../trabajadores/trabajadores.interface";

moment.locale("custom", {
  week: {
    dow: 1, // Lunes es el primer día de la semana
  },
});

@Injectable()
export class Cuadrantes {
  constructor(
    private readonly schCuadrantes: CuadrantesDatabase,
    private readonly tiendasInstance: Tienda,
    private readonly hitInstance: FacTenaMssql,
    private readonly trabajadoresInstance: Trabajador,
  ) {}

  async getCuadrantesIndividual(
    idTienda: number,
    idTrabajador: number,
    semana: number,
    year: number,
  ) {
    return await this.schCuadrantes.getCuadrantesIndividual(
      idTienda,
      idTrabajador,
      semana,
      year,
    );
  }

  async getBolsaHorasById(idSql: number) {
    return 0;
  }

  async getBolsaInicial(idTrabajador: number, year: number, semana: number) {
    // Pasar el número de la semana correcta, esto se calcula con la semana anterior, ojo
    // con la primera semana del año.
    let semanaAnterior: number = null;
    const lunes = moment().year(year).week(semana).day(1).startOf("day");
    lunes.diff(7, "days");
    
    const semanaBuscar = lunes.isoWeek();
    const yearBuscar = lunes.year();

    if (semana === 1) {
      const lastDayOfYear = moment()
        .year(year - 1)
        .month(11)
        .date(31);
      semanaAnterior = lastDayOfYear.isoWeek();
    } else semanaAnterior = semana - 1;


  }

  async getCuadrantes(
    idTienda: number,
    semana: number,
    year: number,
    idSql?: number,
  ) {
    const responsableTienda =
      await this.trabajadoresInstance.getResponsableTienda(idTienda);
    const equipoCompleto = await this.trabajadoresInstance.getSubordinadosById(
      responsableTienda.id,
      moment().year(year).week(semana).day(1).startOf("day"),
    );

    if (idSql) {
      const usuarioActual =
        await this.trabajadoresInstance.getTrabajadorBySqlId(idSql);

      equipoCompleto.push(usuarioActual);
    }

    const cuadrantes: TCuadrante[] = await this.schCuadrantes.getCuadrantes(
      idTienda,
      semana,
      year,
    );

    const cuadrantesVacios: TCuadrante[] = [];
    let hayUno = false;

    for (let i = 0; i < equipoCompleto.length; i += 1) {
      for (let j = 0; j < cuadrantes.length; j += 1) {
        if (equipoCompleto[i].id === cuadrantes[j].idTrabajador) {
          hayUno = true;
          cuadrantes[j]["horasContrato"] = equipoCompleto[i].horasContrato;
          break;
        }
      }

      if (!hayUno) {
        const nuevoCuadrante: TCuadrante = {
          _id: new ObjectId().toString(),
          idTrabajador: equipoCompleto[i].id,
          nombre: equipoCompleto[i].nombreApellidos,
          idTienda: idTienda,
          semana: semana,
          year: new Date().getFullYear(),
          arraySemanalHoras: [null, null, null, null, null, null, null],
          totalHoras: 0,
          enviado: false,
          historialPlanes: [],
          horasContrato: equipoCompleto[i].horasContrato,
          bolsaHorasInicial: 0,
        };

        cuadrantesVacios.push(nuevoCuadrante);
      }
    }
    cuadrantes.push(...cuadrantesVacios);

    for (let i = 0; i < cuadrantes.length; i += 1) {
      cuadrantes[i]["bolsaHorasInicial"] = await this.getBolsaHorasById(
        cuadrantes[i].idTrabajador,
      );

      if (!cuadrantes[i].horasContrato) {
        const trabajadorCuadrante =
          await this.trabajadoresInstance.getTrabajadorBySqlId(
            cuadrantes[i].idTrabajador,
          );
        cuadrantes[i].horasContrato = trabajadorCuadrante.horasContrato;
      }
    }

    return cuadrantes;
  }

  async getTodo() {
    return await this.schCuadrantes.getTodo();
  }
  async getTiendas1Semana(semana: number, year: number) {
    return await this.schCuadrantes.getTiendas1Semana(semana, year);
  }

  async getSemanas1Tienda(idTienda: number) {
    return await this.schCuadrantes.getSemanas1Tienda(idTienda);
  }

  private async getPendientesEnvio() {
    return await this.schCuadrantes.getPendientesEnvio();
  }
  async getCuadranteSemanaTrabajador(idTrabajador: number, semana: number) {
    return await this.schCuadrantes.getCuadranteSemanaTrabajador(
      idTrabajador,
      semana,
    );
  }
  public async sincronizarConHit() {
    const cuadrantes = await this.getPendientesEnvio();
    const tiendas = await this.tiendasInstance.getTiendas();

    // Crear una función asíncrona para manejar la sincronización de cada cuadrante
    const sincronizarCuadrante = async (cuadrante) => {
      let query = "DECLARE @idTurno VARCHAR(255) = NULL";
      let subQuery = "";

      const sqlBorrar = this.schCuadrantes.borrarHistorial(cuadrante);
      const nombreTablaPlanificacion = this.schCuadrantes.nombreTablaSqlHit(
        cuadrante.semana,
      );

      for (let j = 0; j < cuadrante.arraySemanalHoras.length; j += 1) {
        if (
          cuadrante.arraySemanalHoras[j] &&
          !cuadrante.arraySemanalHoras[j].ausencia
        ) {
          const entrada = moment(
            cuadrante.arraySemanalHoras[j].horaEntrada,
            "HH:mm",
          );
          const salida = moment(
            cuadrante.arraySemanalHoras[j].horaSalida,
            "HH:mm",
          );
          const tipoTurno = entrada.format("A") === "AM" ? "M" : "T";

          subQuery += `
            SELECT @idTurno = NULL;
            SELECT TOP 1 @idTurno = idTurno from cdpTurnos WHERE horaInicio = '${
              cuadrante.arraySemanalHoras[j].horaEntrada
            }' AND horaFin = '${cuadrante.arraySemanalHoras[j].horaSalida}';
  
            IF @idTurno IS NOT NULL
              BEGIN
                DELETE FROM ${nombreTablaPlanificacion} WHERE idPlan = '${
            cuadrante.arraySemanalHoras[j].idPlan
          }';
                INSERT INTO ${nombreTablaPlanificacion} (
                  idPlan, 
                  fecha, 
                  botiga, 
                  periode, 
                  idTurno, 
                  usuarioModif, 
                  fechaModif, 
                  activo
                ) 
                VALUES (
                  '${cuadrante.arraySemanalHoras[j].idPlan}', 
                  CONVERT(datetime, '${moment()
                    .week(cuadrante.semana)
                    .weekday(j)
                    .format("DD/MM/YYYY")}', 103),
                  ${this.tiendasInstance.convertirTiendaToExterno(
                    cuadrante.idTienda,
                    tiendas,
                  )}, 
                  '${tipoTurno}', 
                  @idTurno, 
                  '365EquipoDeTrabajo', 
                  GETDATE(), 
                  1
                );
              END
            ELSE
              BEGIN
                SELECT @idTurno = NEWID()
                INSERT INTO cdpTurnos (
                  nombre, 
                  horaInicio, 
                  horaFin, 
                  idTurno, 
                  color, 
                  tipoEmpleado
                ) 
                VALUES (
                  'De ${entrada.format("HH:mm")} a ${salida.format("HH:mm")}', 
                  '${entrada.format("HH:mm")}', 
                  '${salida.format("HH:mm")}', 
                  @idTurno, 
                  '#DDDDDD', 
                  'RESPONSABLE/DEPENDENTA
                  ');
                  DELETE FROM ${nombreTablaPlanificacion} WHERE idPlan = '${
            cuadrante.arraySemanalHoras[j].idPlan
          }';
                  INSERT INTO ${nombreTablaPlanificacion} (
                    idPlan, 
                    fecha, 
                    botiga, 
                    periode, 
                    idTurno, 
                    usuarioModif, 
                    fechaModif, 
                    activo
                  ) 
                  VALUES (
                    '${cuadrante.arraySemanalHoras[j].idPlan}', 
                    CONVERT(datetime, '${moment()
                      .week(cuadrante.semana)
                      .weekday(j)
                      .format("DD/MM/YYYY")}', 103),
                    ${this.tiendasInstance.convertirTiendaToExterno(
                      cuadrante.idTienda,
                      tiendas,
                    )}, 
                    '${tipoTurno}', 
                    @idTurno, 
                    '365EquipoDeTrabajo', 
                    GETDATE(), 
                    1
                  );
              END
          `;
        }
      }

      const resPlanes = await this.hitInstance.recHit(
        sqlBorrar + query + subQuery,
      );

      if (resPlanes.rowsAffected.includes(1)) {
        await this.schCuadrantes.setCuadranteEnviado(cuadrante._id);
      } else {
        throw Error("Fallo en la consulta");
      }
    };
    // Dividir los cuadrantes en lotes y procesarlos en paralelo con Promise.all
    const batchSize = 60; // Ajusta este valor según sea necesario
    for (let i = 0; i < cuadrantes.length; i += batchSize) {
      const batch = cuadrantes.slice(i, i + batchSize);
      await Promise.all(batch.map(sincronizarCuadrante));
    }

    return true;
  }

  async saveCuadrante(cuadrante: TCuadrante, oldCuadrante: TCuadrante) {
    if (oldCuadrante) {
      cuadrante.historialPlanes = oldCuadrante.historialPlanes;
      cuadrante._id = oldCuadrante._id;
    }
    cuadrante.enviado = false;

    for (let i = 0; i < cuadrante.arraySemanalHoras.length; i += 1) {
      let update = false;
      if (cuadrante.arraySemanalHoras[i].bloqueado) {
        cuadrante.arraySemanalHoras[i] = oldCuadrante.arraySemanalHoras[i];
        continue;
      }

      if (cuadrante.arraySemanalHoras[i].idPlan) {
        update = true;
        if (
          !cuadrante.historialPlanes.includes(
            cuadrante.arraySemanalHoras[i].idPlan,
          )
        )
          cuadrante.historialPlanes.push(cuadrante.arraySemanalHoras[i].idPlan);
      }

      if (
        cuadrante.arraySemanalHoras[i].horaEntrada &&
        cuadrante.arraySemanalHoras[i].horaSalida
      ) {
        if (!update) {
          cuadrante.arraySemanalHoras[i].idPlan = new ObjectId().toString();
        }
      } else {
        cuadrante.arraySemanalHoras[i] = null;
        continue;
      }
    }

    if (oldCuadrante) {
      if (await this.schCuadrantes.updateCuadrante(cuadrante)) return true;
      throw Error("No se ha podido actualizar el cuadrante");
    } else {
      cuadrante.historialPlanes = [];
      const idCuadrante = await this.schCuadrantes.insertCuadrante(cuadrante);
      if (idCuadrante) return true;
      throw Error("No se ha podido insertar el cuadrante");
    }
  }

  semanasEnRango(ausencia: AusenciaInterface) {
    const semanas: { year: number; week: number }[] = [];
    const inicio = moment(ausencia.fechaInicio);
    const final = moment(ausencia.fechaFinal);

    for (
      let currentDate = inicio;
      currentDate.isSameOrBefore(final);
      currentDate.add(1, "days")
    ) {
      const year = currentDate.year();
      const week = currentDate.isoWeek();

      if (!semanas.some((sw) => sw.year === year && sw.week === week)) {
        semanas.push({ year, week });
      }
    }

    return semanas;
  }

  private estaEnRango(
    fecha: moment.Moment,
    fechaInicio: moment.Moment,
    fechaFinal: moment.Moment,
  ): boolean {
    // Agrega un día a la fecha final para incluirlo en el rango
    fechaFinal.add(1, "days");
    return fecha.isSameOrAfter(fechaInicio) && fecha.isBefore(fechaFinal);
  }

  private crearAusencia(
    parcial: { dia: Date; horas: number },
    tipo: TiposAusencia,
  ): {
    tipo: TiposAusencia;
    parcial: boolean;
    horasParcial?: number;
  } {
    if (parcial) {
      return {
        tipo: tipo,
        parcial: true,
        horasParcial: parcial.horas,
      };
    }
    return {
      tipo: tipo,
      parcial: false,
    };
  }

  private actualizarCuadranteConAusencia(
    cuadrante: TCuadrante,
    ausencia: AusenciaInterface,
  ): void {
    cuadrante.arraySemanalHoras = cuadrante.arraySemanalHoras.map(
      (horas, index) => {
        const fecha = moment()
          .year(cuadrante.year)
          .isoWeek(cuadrante.semana)
          .day(index + 1);
        if (
          this.estaEnRango(
            fecha,
            moment(ausencia.fechaInicio),
            moment(ausencia.fechaFinal),
          )
        ) {
          const parcial = ausencia.arrayParciales.find((p) =>
            moment(p.dia).isSame(fecha, "day"),
          );
          return {
            horaEntrada: horas ? horas.horaEntrada : "",
            horaSalida: horas ? horas.horaSalida : "",
            idPlan: horas ? horas.idPlan : "",
            ausencia: this.crearAusencia(parcial, ausencia.tipo),
          };
        }
        return horas;
      },
    );
  }

  private crearNuevoCuadrante(
    trabajador: TrabajadorSql,
    semana: { week: number; year: number },
    ausencia: AusenciaInterface,
  ): TCuadrante {
    return {
      idTrabajador: ausencia.idUsuario,
      nombre: trabajador.nombreApellidos,
      idTienda: trabajador.idTienda,
      enviado: false,
      historialPlanes: [],
      totalHoras: null,
      semana: semana.week,
      year: semana.year,
      arraySemanalHoras: Array.from({ length: 7 }, (_, index) => {
        const fecha = moment()
          .year(semana.year)
          .isoWeek(semana.week)
          .day(index + 1);

        if (
          this.estaEnRango(
            fecha,
            moment(ausencia.fechaInicio),
            moment(ausencia.fechaFinal),
          )
        ) {
          const parcial = ausencia.arrayParciales.find((p) =>
            moment(p.dia).isSame(fecha, "day"),
          );
          return {
            horaEntrada: "",
            horaSalida: "",
            idPlan: "",
            ausencia: this.crearAusencia(parcial, ausencia.tipo),
          };
        }
        return null;
      }),
    };
  }

  async agregarAusencia(ausencia: AusenciaInterface): Promise<void> {
    const semanas = this.semanasEnRango(ausencia);
    const cuadrantes =
      semanas.length > 0
        ? await this.schCuadrantes.cuadrantesPorAusencia(ausencia, semanas)
        : [];
    const trabajador = await this.trabajadoresInstance.getTrabajadorBySqlId(
      ausencia.idUsuario,
    );

    const cuadrantesPorSemana = new Map(
      semanas.map((semana) => [
        `${semana.year}-${semana.week}`,
        cuadrantes.find(
          (cuadrante) =>
            cuadrante.year === semana.year && cuadrante.semana === semana.week,
        ),
      ]),
    );

    for (const semana of semanas) {
      const cuadrante = cuadrantesPorSemana.get(
        `${semana.year}-${semana.week}`,
      );

      if (cuadrante) {
        this.actualizarCuadranteConAusencia(cuadrante, ausencia);
        await this.schCuadrantes.actualizarCuadranteAusencia(cuadrante);
      } else {
        const nuevoCuadrante = this.crearNuevoCuadrante(
          trabajador,
          semana,
          ausencia,
        );
        await this.schCuadrantes.crearCuadranteAusencia(nuevoCuadrante);
      }
    }

    if (cuadrantes.length === 0) {
      const fechaInicio = moment(ausencia.fechaInicio);
      const fechaFinal = moment(ausencia.fechaFinal);

      while (fechaInicio.isSameOrBefore(fechaFinal, "day")) {
        const semana = {
          year: fechaInicio.year(),
          week: fechaInicio.isoWeek(),
        };

        if (!cuadrantesPorSemana.has(`${semana.year}-${semana.week}`)) {
          const nuevoCuadrante = this.crearNuevoCuadrante(
            trabajador,
            semana,
            ausencia,
          );
          await this.schCuadrantes.crearCuadranteAusencia(nuevoCuadrante);
          cuadrantesPorSemana.set(
            `${semana.year}-${semana.week}`,
            nuevoCuadrante,
          );
        }

        fechaInicio.add(1, "days");
      }
    }
  }

  async copiarCuadrante(
    semanaOrigen: number,
    semanaDestino: number,
    yearOrigen: number,
    yearDestino: number,
    idTienda: number,
  ) {
    const cuadrantesOrigen = await this.getCuadrantes(
      idTienda,
      semanaOrigen,
      yearOrigen,
    );

    const cuadrantesDestino: TCuadrante[] = cuadrantesOrigen.map(
      (cuadrante) => {
        cuadrante._id = new ObjectId().toString();
        cuadrante.semana = semanaDestino;
        cuadrante.year = yearDestino;
        cuadrante.enviado = false;
        return cuadrante;
      },
    );

    if (await this.schCuadrantes.insertCuadrantes(cuadrantesDestino))
      return true;
    else throw Error("No se han podido guardar las copias de los cuadrantes");
  }
}
