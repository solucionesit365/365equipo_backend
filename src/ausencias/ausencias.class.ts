import { Injectable } from "@nestjs/common";
import { AusenciasDatabase } from "./ausencias.mongodb";
import { Cuadrantes } from "../cuadrantes/cuadrantes.class";
import { ObjectId } from "mongodb";
import { TiposAusencia } from "../cuadrantes/cuadrantes.interface";
import { AusenciaInterface } from "./ausencias.interface";
import { DateTime } from "luxon";

@Injectable()
export class AusenciasService {
  constructor(
    private readonly schAusencias: AusenciasDatabase,
    private readonly cuadrantesInstance: Cuadrantes,
  ) {}

  // Cuadrantes 2.0
  async nuevaAusencia(
    idUsuario: number,
    nombre: string,
    dni: string,
    tipo: TiposAusencia,
    horasContrato: number,
    tienda: string,
    fechaInicio: Date,
    fechaFinal: Date,
    fechaRevision: Date,
    comentario: string,
    completa: boolean,
    horas: number,
  ) {
    return await this.schAusencias.nuevaAusencia({
      idUsuario,
      nombre,
      dni,
      tipo,
      horasContrato,
      tienda,
      fechaInicio,
      fechaFinal,
      fechaRevision,
      comentario,
      completa,
      horas,
    });
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

    return true; // Devuelve true o lo que necesites para indicar que la operación fue exitosa.
  }

  // actualiza aunsencias sin fechaRevision
  async updateAusencia(ausencia: AusenciaInterface) {
    const ausenciaToUpdate = await this.schAusencias.getAusenciasById(
      new ObjectId(ausencia._id),
    );
    if (!ausenciaToUpdate) {
      throw new Error("Ausencia no encontrada");
    }

    const fechaFinalToUpdate = ausenciaToUpdate.fechaFinal
      ? ausenciaToUpdate.fechaFinal
      : ausenciaToUpdate.fechaRevision;
    // if (
    //   // Verifica si `fechaInicio` ha cambiado o uno de ellos es `null`
    //   (ausenciaToUpdate.fechaInicio &&
    //     ausencia.fechaInicio &&
    //     ausenciaToUpdate.fechaInicio.getTime() !==
    //       ausencia.fechaInicio.getTime()) ||
    //   (!ausenciaToUpdate.fechaInicio && ausencia.fechaInicio) ||
    //   (ausenciaToUpdate.fechaInicio && !ausencia.fechaInicio) ||
    //   // Verifica si `fechaFinalToUpdate` ha cambiado
    //   (fechaFinalToUpdate &&
    //     ausencia.fechaFinal &&
    //     fechaFinalToUpdate.getTime() !== ausencia.fechaFinal.getTime()) ||
    //   (!fechaFinalToUpdate && ausencia.fechaFinal)
    // ) {
    //   // Si las fechas de la ausencia han cambiado, llama a addAusenciaToCuadrantes
    //   await this.cuadrantesInstance.addAusenciaToCuadrantes(ausencia);
    // }

    await this.schAusencias.updateAusencia(ausencia);

    // Elimina cuadrantes que están fuera del nuevo rango de fechas
    await this.schAusencias.eliminarCuadrantesFueraDeRango(
      ausencia.idUsuario,
      ausencia.fechaInicio,
      ausencia.fechaFinal,
      ausencia.tipo,
    );

    return true;
  }

  async updateAusenciaResto(ausencia: AusenciaInterface) {
    const ausenciaToUpdate = await this.schAusencias.getAusenciasById(
      new ObjectId(ausencia._id),
    );

    if (!ausenciaToUpdate) {
      throw new Error("Ausencia no encontrada");
    }

    const fechaFinalToUpdate = ausenciaToUpdate.fechaFinal
      ? ausenciaToUpdate.fechaFinal
      : ausenciaToUpdate.fechaRevision;

    // if (
    //   // Verifica si `fechaInicio` ha cambiado o uno de ellos es `null`
    //   (ausenciaToUpdate.fechaInicio &&
    //     ausencia.fechaInicio &&
    //     ausenciaToUpdate.fechaInicio.getTime() !==
    //       ausencia.fechaInicio.getTime()) ||
    //   (!ausenciaToUpdate.fechaInicio && ausencia.fechaInicio) ||
    //   (ausenciaToUpdate.fechaInicio && !ausencia.fechaInicio) ||
    //   // Verifica si `fechaFinalToUpdate` ha cambiado
    //   (fechaFinalToUpdate &&
    //     ausencia.fechaFinal &&
    //     fechaFinalToUpdate.getTime() !== ausencia.fechaFinal.getTime()) ||
    //   (!fechaFinalToUpdate && ausencia.fechaFinal)
    // ) {
    //   // Si las fechas de la ausencia han cambiado, llama a addAusenciaToCuadrantes
    //   await this.cuadrantesInstance.addAusenciaToCuadrantes(ausencia);
    // }

    await this.schAusencias.updateAusenciaResto(ausencia);

    // Elimina cuadrantes que están fuera del nuevo rango de fechas
    await this.schAusencias.eliminarCuadrantesFueraDeRango(
      ausencia.idUsuario,
      ausencia.fechaInicio,
      ausencia.fechaFinal,
      ausencia.tipo,
    );

    return true;
  }

  async getAusencias() {
    return await this.schAusencias.getAusencias();
  }

  async getAusenciaById(idAusencia: ObjectId) {
    return await this.schAusencias.getAusenciasById(idAusencia);
  }

  async getAusenciasTrabajador(
    idTrabajador: number,
    inicio: DateTime,
    final: DateTime,
  ) {
    return await this.schAusencias.getAusenciasTrabajador(
      idTrabajador,
      inicio,
      final,
    );
  }

  async getAusenciasIntervalo(fechaInicio: DateTime, fechaFinal: DateTime) {
    return await this.schAusencias.getAusenciasIntervalo(
      fechaInicio,
      fechaFinal,
    );
  }
}
