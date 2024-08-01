import { Injectable, Inject, forwardRef } from "@nestjs/common";
import * as moment from "moment";
import { CuadrantesDatabase } from "./cuadrantes.mongodb";
import { ObjectId, WithId } from "mongodb";
import { TCuadrante } from "./cuadrantes.interface";
import { Tienda } from "../tiendas/tiendas.class";
import { HitMssqlService } from "../hit-mssql/hit-mssql.service";
import { AusenciaInterface } from "../ausenciasOLD/ausencias.interface";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { FichajesValidadosService } from "../fichajes-validadosOLD/fichajes-validados.class";
import { DateTime } from "luxon";
import { ContratoService } from "../contrato/contrato.service";
import { Trabajador } from "@prisma/client";
import { CopiarSemanaCuadranteDto } from "./cuadrantes.dto";

moment.locale("custom", {
  week: {
    dow: 1, // Lunes es el primer día de la semana
  },
});

@Injectable()
export class Cuadrantes {
  constructor(
    private readonly schCuadrantes: CuadrantesDatabase,
    private readonly contratoService: ContratoService,
    private readonly tiendasInstance: Tienda,
    private readonly hitMssqlService: HitMssqlService,
    @Inject(forwardRef(() => TrabajadorService))
    private readonly trabajadoresInstance: TrabajadorService,
    private readonly fichajesValidadosInstance: FichajesValidadosService,
  ) {}

  // // Solo para migraciones
  // async getAllCuadrantes() {
  //   return await this.schCuadrantes.getAllCuadrantes();
  // }

  // async rectificarAllCuadrantes(cuadrantes: TCuadrante[]) {
  //   return await this.schCuadrantes.rectificarAllCuadrantes(cuadrantes);
  // }
  // final de migraciones
}
