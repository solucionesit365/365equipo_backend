import { Injectable } from "@nestjs/common";
import * as moment from "moment";
import { TrabajadorCompleto } from "../trabajadores/trabajadores.interface";

moment.locale("custom", {
  week: {
    dow: 1, // Lunes es el primer día de la semana
  },
});

@Injectable()
export class Cuadrantes {
  constructor() {}

  async addCuadrante(cuadrante: ObjCuadrante, trabajador: TrabajadorCompleto) {
    const semanaActual = moment().startOf("week");
    
  }
}
