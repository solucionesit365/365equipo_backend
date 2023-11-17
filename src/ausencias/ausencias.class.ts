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
    fechaRevision: Date,
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
    console.log(idAusencia);

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

  // async updateAusencia(ausencia: AusenciaInterface) {
  //   return await this.schAusencias.updateAusencia(ausencia);
  // }

  // async updateAusenciaResto(ausencia: AusenciaInterface) {
  //   return await this.schAusencias.updateAusenciaResto(ausencia);
  // }

  async getAusencias() {
    return await this.schAusencias.getAusencias();
  }

  async getAusenciaById(idAusencia: ObjectId) {
    return await this.schAusencias.getAusenciasById(idAusencia);
  }

  async getAusenciasPendientes() {
    return await this.schAusencias.getAusenciasPendientes();
  }

  async marcarComoEnviada(idAusencia: string) {
    return await this.schAusencias.marcarComoEnviada(new ObjectId(idAusencia));
  }
}
