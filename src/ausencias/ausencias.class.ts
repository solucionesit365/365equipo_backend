import { Injectable } from "@nestjs/common";
import { AusenciasDatabase } from "./ausencias.mongodb";
import { Cuadrantes } from "../cuadrantes/cuadrantes.class";
import * as moment from "moment";
import { ObjectId } from "mongodb";
import { TiposAusencia } from "../cuadrantes/cuadrantes.interface";
import { AusenciaInterface } from "./ausencias.interface";
import { HitMssqlService } from "../hit-mssql/hit-mssql.service";
HitMssqlService;

@Injectable()
export class Ausencias {
  constructor(
    private readonly schAusencias: AusenciasDatabase,
    private readonly cuadrantesInstance: Cuadrantes,
    private readonly facTenaService: HitMssqlService,
  ) {}

  // Cuadrantes 2.0
  async nuevaAusencia(
    idUsuario: number,
    nombre: string,
    dni: string,
    tipo: TiposAusencia,
    fechaInicio: Date,
    fechaFinal: Date,
    fechaRevision: Date,
    comentario: string,
    completa: boolean,
    horas: number,
  ) {
    const resInsert = await this.schAusencias.nuevaAusencia({
      idUsuario,
      nombre,
      dni,
      tipo,
      fechaInicio,
      fechaFinal,
      fechaRevision,
      comentario,
      completa,
      horas,
    });

    if (resInsert) {
      await this.cuadrantesInstance.addAusenciaToCuadrantes({
        completa,
        comentario,
        fechaFinal,
        fechaInicio,
        fechaRevision,
        idUsuario,
        nombre,
        dni,
        horas,
        tipo,
      });
      return resInsert;
    }
  }

  async deleteAusencia(idAusencia: string) {
    // 1. Primero, obten la ausencia que vas a eliminar para poder usar sus propiedades.
    const ausenciaToDelete = await this.schAusencias.getAusenciasById(
      new ObjectId(idAusencia),
    );
    if (!ausenciaToDelete) {
      throw new Error("Ausencia no encontrada");
    }

    // 2. Elimina la ausencia de schAusencias.
    await this.schAusencias.deleteAusencia(idAusencia);

    // 3. Luego, elimina la ausencia de cuadrantesInstance.
    await this.cuadrantesInstance.removeAusenciaFromCuadrantes(
      ausenciaToDelete.tipo,
      ausenciaToDelete.idUsuario,
      ausenciaToDelete.fechaInicio,
      ausenciaToDelete.fechaFinal,
    );

    return true; // Devuelve true o lo que necesites para indicar que la operación fue exitosa.
  }

  async updateAusencia(ausencia: AusenciaInterface) {
    return await this.schAusencias.updateAusencia(ausencia);
  }

  async updateAusenciaResto(ausencia: AusenciaInterface) {
    return await this.schAusencias.updateAusenciaResto(ausencia);
  }

  async getAusencias() {
    return await this.schAusencias.getAusencias();
  }

  async sincroAusenciasHit() {
    const ausenciasPendientes = await this.schAusencias.getAusenciasSincro();

    // param0 = diaAusencia
    // param1 = idEmpleado
    // param2 = ${tipoAusencia}[Horas:${horas}]

    for (let i = 0; i < ausenciasPendientes.length; i += 1) {
      const fechaInicial = moment(ausenciasPendientes[i].fechaInicio);
      const fechaFinal = moment(ausenciasPendientes[i].fechaFinal);

      while (fechaInicial.isSameOrBefore(fechaFinal)) {
        let sql = "";
        const nombreTabla = `cdpCalendariLaboral_${fechaInicial.year()}`;
        sql += `
            INSERT INTO ${nombreTabla} (id, fecha, idEmpleado, estado, observaciones, TimeStamp, usuarioModif)
            VALUES (
              NEWID(),
              CONVERT(datetime, @param0, 103),
              @param1,
              'JUSTIFICADAS',
              @param2,
              getdate(),
              '365Equipo'
            )
      `;
        let observaciones = "";
        // const esParcial = this.esParcial(
        //   ausenciasPendientes[i].arrayParciales,
        //   fechaInicial.toDate(),
        // );

        // Tratamiento diferente para las parciales
        if (
          !ausenciasPendientes[i].completa &&
          ausenciasPendientes[i].horas > 0
        ) {
          observaciones =
            ausenciasPendientes[i].tipo +
            `[Horas:${ausenciasPendientes[i].horas}]`;
        } else {
          observaciones = ausenciasPendientes[i].tipo + `[Horas:8]`;
        }

        await this.facTenaService.recHitBind(
          sql,
          fechaInicial.format("DD/MM/YYYY"),
          ausenciasPendientes[i].idUsuario,
          observaciones,
        );

        fechaInicial.add(1, "days");
      }
      if (!this.schAusencias.marcarComoEnviada(ausenciasPendientes[i]._id))
        throw Error("No se ha podido guardar el estado enviado de la ausencia");
    }
  }

  async getAusenciaById(idAusencia: ObjectId) {
    return await this.schAusencias.getAusenciasById(idAusencia);
  }
}
