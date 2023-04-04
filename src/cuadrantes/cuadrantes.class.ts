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

  async addCuadrante(cuadrante: TCuadrante) {
    cuadrante.arraySemanalHoras = cuadrante.arraySemanalHoras.map((itemDia) => {
      if (itemDia && !itemDia.idPlan) itemDia.idPlan = new ObjectId();

      return itemDia;
    });

    const idCuadrante = await this.schCuadrantes.addCuadrante(cuadrante);

    if (idCuadrante) return true;
    throw Error("No se ha podido insertar el cuadrante");
  }
}
