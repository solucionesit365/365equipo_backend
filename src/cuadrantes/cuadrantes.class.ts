import { Injectable } from "@nestjs/common";
import * as moment from "moment";
import { CuadrantesDatabase } from "./cuadrantes.mongodb";
import { ObjectId } from "mongodb";
import { TCuadrante } from "./cuadrantes.interface";

moment.locale("custom", {
  week: {
    dow: 1, // Lunes es el primer día de la semana
  },
});

@Injectable()
export class Cuadrantes {
  constructor(private readonly schCuadrantes: CuadrantesDatabase) {}

  async getCuadrantes(idTienda: number, idTrabajador: number, semana: number) {
    return await this.schCuadrantes.getCuadrantes(
      idTienda,
      idTrabajador,
      semana,
    );
  }

  async saveCuadrante(cuadrante: TCuadrante, oldCuadrante: TCuadrante) {
    if (oldCuadrante) {
      cuadrante.historialPlanes = oldCuadrante.historialPlanes;
      cuadrante._id = oldCuadrante._id;
      cuadrante.enviado = false;
    }

    for (let i = 0; i < cuadrante.arraySemanalHoras.length; i += 1) {
      let update = false;
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
}
