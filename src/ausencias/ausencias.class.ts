import { Injectable } from "@nestjs/common";
import { AusenciaInterface, TiposAusencia } from "./ausencias.interface";
import { AusenciasDatabase } from "./ausencias.mongodb";
import { Cuadrantes } from "../cuadrantes/cuadrantes.class";
import * as moment from "moment";
import { recHitBind } from "../bbdd/mssql";

@Injectable()
export class Ausencias {
  constructor(
    private readonly schAusencias: AusenciasDatabase,
    private readonly cuadrantesInstance: Cuadrantes,
  ) { }

  async nuevaAusencia(
    idUsuario: number,
    nombre: string,
    tipo: TiposAusencia,
    fechaInicio: Date,
    fechaFinal: Date,
    comentario: string,
    arrayParciales: { dia: Date; horas: number }[],
  ) {
    const resInsert = await this.schAusencias.nuevaAusencia({
      idUsuario,
      nombre,
      tipo,
      fechaInicio,
      fechaFinal,
      comentario,
      arrayParciales,
    });

    if (resInsert) {
      await this.cuadrantesInstance.agregarAusencia({
        arrayParciales,
        comentario,
        fechaFinal,
        fechaInicio,
        idUsuario,
        nombre,
        tipo,
      });
      return resInsert;
    }
  }

  async deleteAusencia(idAusencia: string) {
    return await this.schAusencias.deleteAusencia(idAusencia);
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

  mismoDia(itemParciales: Date, current: Date) {
    return (
      itemParciales.getFullYear() === current.getFullYear() &&
      itemParciales.getMonth() === current.getMonth() &&
      itemParciales.getDate() === current.getDate()
    );
  }

  esParcial(
    arrayParciales: AusenciaInterface["arrayParciales"],
    current: Date,
  ) {
    for (let i = 0; i < arrayParciales.length; i += 1) {
      if (this.mismoDia(new Date(arrayParciales[i].dia), current))
        return { index: i };
    }
    return false;
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
        const esParcial = this.esParcial(
          ausenciasPendientes[i].arrayParciales,
          fechaInicial.toDate(),
        );

        if (esParcial) {
          observaciones =
            ausenciasPendientes[i].tipo +
            `[Horas:${ausenciasPendientes[i].arrayParciales[esParcial.index].horas
            }]`;
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
}
