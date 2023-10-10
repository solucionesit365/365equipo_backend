import { Injectable } from "@nestjs/common";
import { AusenciasDatabase } from "./ausencias.mongodb";
import { Cuadrantes } from "../cuadrantes/cuadrantes.class";
import * as moment from "moment";
import { recHitBind } from "../bbdd/mssql";
import { ObjectId } from "mongodb";
import { TiposAusencia } from "src/cuadrantes/cuadrantes.interface";

@Injectable()
export class Ausencias {
  constructor(
    private readonly schAusencias: AusenciasDatabase,
    private readonly cuadrantesInstance: Cuadrantes,
  ) {}

  // Cuadrantes 2.0
  async nuevaAusencia(
    idUsuario: number,
    nombre: string,
    tipo: TiposAusencia,
    fechaInicio: Date,
    fechaFinal: Date,
    comentario: string,
    completa: boolean,
    horas: number,
  ) {
    const resInsert = await this.schAusencias.nuevaAusencia({
      idUsuario,
      nombre,
      tipo,
      fechaInicio,
      fechaFinal,
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
        idUsuario,
        nombre,
        horas,
        tipo,
      });
      return resInsert;
    }
  }

  async deleteAusencia(idAusencia: string) {
    return await this.schAusencias.deleteAusencia(idAusencia);
  }

  // async updateAusencia(ausencia: AusenciaInterface) {
  //   return await this.schAusencias.updateAusencia(ausencia);
  // }

  // async updateAusenciaResto(ausencia: AusenciaInterface) {
  //   return await this.schAusencias.updateAusenciaResto(ausencia);
  // }

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

        await recHitBind(
          "Fac_Tena",
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
