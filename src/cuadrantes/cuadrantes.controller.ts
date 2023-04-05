import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Headers,
  Query,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { getUserWithToken } from "../firebase/auth";
import { TokenService } from "../get-token/get-token.service";
import { Cuadrantes } from "./cuadrantes.class";
import { TCuadrante } from "./cuadrantes.interface";

// /*Borrar de uso temporal */
// import { app } from "../firebase/app";
// import { db } from "../firebase/firestore";
// import { ObjectId } from "mongodb";
// import { recSoluciones } from "src/bbdd/mssql";

// /* final borrar */

@Controller("cuadrantes")
export class CuadrantesController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly cuadrantesInstance: Cuadrantes,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async getCuadrantes(
    @Query() { semana }: { semana: string },
    @Headers("authorization") authHeader: string,
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      const usuario = await getUserWithToken(token);

      if (!semana) throw Error("Faltan datos");

      if (usuario.coordinadora && usuario.idTienda) {
        return {
          ok: true,
          data: await this.cuadrantesInstance.getCuadrantes(
            usuario.idTienda,
            Number(semana),
          ),
        };
      }
      throw Error("Opción no disponible para este tipo de empled@");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("individual")
  @UseGuards(AuthGuard)
  async getCuadrantesIndividual(
    @Query() { semana, idTrabajador }: { semana: string; idTrabajador: string },
    @Headers("authorization") authHeader: string,
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      const usuario = await getUserWithToken(token);

      if (!semana || !idTrabajador) throw Error("Faltan datos");

      if (usuario.coordinadora && usuario.idTienda) {
        return {
          ok: true,
          data: await this.cuadrantesInstance.getCuadrantesIndividual(
            usuario.idTienda,
            Number(idTrabajador),
            Number(semana),
          ),
        };
      }
      throw Error("Opción no disponible para este tipo de empled@");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Post("saveCuadrante")
  @UseGuards(AuthGuard)
  async saveCuadrante(
    @Body() cuadrante: TCuadrante,
    @Headers("authorization") authHeader: string,
  ) {
    try {
      if (!cuadrante) throw Error("Faltan datos");
      const token = this.tokenService.extract(authHeader);
      const usuario = await getUserWithToken(token);

      if (usuario.coordinadora && usuario.idTienda) {
        // cuadrante.idTienda = usuario.idTienda;
        // cuadrante.enviado = false;
        const oldCuadrante =
          await this.cuadrantesInstance.getCuadrantesIndividual(
            usuario.idTienda,
            cuadrante.idTrabajador,
            cuadrante.semana,
          );
        cuadrante.idTienda = usuario.idTienda;
        await this.cuadrantesInstance.saveCuadrante(cuadrante, oldCuadrante);
        return { ok: true };
      }
      throw Error("No llevas equipo o tienda para realizar esta acción");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  // @Post("traspasoBorrar")
  // async traspasoBorrar() {
  //   try {
  //     const resTiendas = await recSoluciones(
  //       "soluciones",
  //       "SELECT * FROM tiendas",
  //     );
  //     const tiendas = resTiendas.recordset;
  //     const todos = await this.cuadrantesInstance.getTodo();

  //     const tiendasCorregidas = todos.map((cuadrante) => {
  //       let idTienda = 0;
  //       for (let i = 0; i < tiendas.length; i += 1) {
  //         if (tiendas[i].idExterno === cuadrante.idTienda)
  //           idTienda = tiendas[i].id;
  //       }
  //       cuadrante.idTienda = idTienda;
  //       return cuadrante;
  //     });

  //     return tiendasCorregidas;
  //     // const cuadrantesCreadosRef = db.collection("cuadrantesCreados");
  //     // const querySnapshot = await cuadrantesCreadosRef
  //     //   .where("semana", "==", 16)
  //     //   .get();
  //     // const cuadrantesCreados = [];
  //     // querySnapshot.forEach((doc) => {
  //     //   cuadrantesCreados.push({ id: doc.id, ...doc.data() });
  //     // });

  //     // // return cuadrantesCreados;
  //     // const arrayBueno = cuadrantesCreados.map((cuadrante) => {
  //     //   const bueno = {
  //     //     idTienda: cuadrante.tienda,
  //     //     semana: cuadrante.semana,
  //     //     totalHoras: cuadrante.totalHoras,
  //     //     idTrabajador: cuadrante.idTrabajador,
  //     //     nombre: cuadrante.nombre,
  //     //     enviado: false,
  //     //     historialPlanes: [],
  //     //     arraySemanalHoras: [],
  //     //   };

  //     //   const arraySemanalHoras = [];

  //     //   let i = 0;
  //     //   if (
  //     //     cuadrante.arraySemanalHoras[i].horaEntrada &&
  //     //     cuadrante.arraySemanalHoras[i].horaSalida
  //     //   ) {
  //     //     arraySemanalHoras.push({
  //     //       horaEntrada: cuadrante.arraySemanalHoras[i].horaEntrada,
  //     //       horaSalida: cuadrante.arraySemanalHoras[i].horaSalida,
  //     //       idPlan: new ObjectId().toString(),
  //     //     });
  //     //   } else arraySemanalHoras.push(null);

  //     //   i = 1;
  //     //   if (
  //     //     cuadrante.arraySemanalHoras[i].horaEntrada &&
  //     //     cuadrante.arraySemanalHoras[i].horaSalida
  //     //   ) {
  //     //     arraySemanalHoras.push({
  //     //       horaEntrada: cuadrante.arraySemanalHoras[i].horaEntrada,
  //     //       horaSalida: cuadrante.arraySemanalHoras[i].horaSalida,
  //     //       idPlan: new ObjectId().toString(),
  //     //     });
  //     //   } else arraySemanalHoras.push(null);
  //     //   i = 2;
  //     //   if (
  //     //     cuadrante.arraySemanalHoras[i].horaEntrada &&
  //     //     cuadrante.arraySemanalHoras[i].horaSalida
  //     //   ) {
  //     //     arraySemanalHoras.push({
  //     //       horaEntrada: cuadrante.arraySemanalHoras[i].horaEntrada,
  //     //       horaSalida: cuadrante.arraySemanalHoras[i].horaSalida,
  //     //       idPlan: new ObjectId().toString(),
  //     //     });
  //     //   } else arraySemanalHoras.push(null);
  //     //   i = 3;
  //     //   if (
  //     //     cuadrante.arraySemanalHoras[i].horaEntrada &&
  //     //     cuadrante.arraySemanalHoras[i].horaSalida
  //     //   ) {
  //     //     arraySemanalHoras.push({
  //     //       horaEntrada: cuadrante.arraySemanalHoras[i].horaEntrada,
  //     //       horaSalida: cuadrante.arraySemanalHoras[i].horaSalida,
  //     //       idPlan: new ObjectId().toString(),
  //     //     });
  //     //   } else arraySemanalHoras.push(null);
  //     //   i = 4;
  //     //   if (
  //     //     cuadrante.arraySemanalHoras[i].horaEntrada &&
  //     //     cuadrante.arraySemanalHoras[i].horaSalida
  //     //   ) {
  //     //     arraySemanalHoras.push({
  //     //       horaEntrada: cuadrante.arraySemanalHoras[i].horaEntrada,
  //     //       horaSalida: cuadrante.arraySemanalHoras[i].horaSalida,
  //     //       idPlan: new ObjectId().toString(),
  //     //     });
  //     //   } else arraySemanalHoras.push(null);
  //     //   i = 5;
  //     //   if (
  //     //     cuadrante.arraySemanalHoras[i].horaEntrada &&
  //     //     cuadrante.arraySemanalHoras[i].horaSalida
  //     //   ) {
  //     //     arraySemanalHoras.push({
  //     //       horaEntrada: cuadrante.arraySemanalHoras[i].horaEntrada,
  //     //       horaSalida: cuadrante.arraySemanalHoras[i].horaSalida,
  //     //       idPlan: new ObjectId().toString(),
  //     //     });
  //     //   } else arraySemanalHoras.push(null);
  //     //   i = 6;
  //     //   if (
  //     //     cuadrante.arraySemanalHoras[i].horaEntrada &&
  //     //     cuadrante.arraySemanalHoras[i].horaSalida
  //     //   ) {
  //     //     arraySemanalHoras.push({
  //     //       horaEntrada: cuadrante.arraySemanalHoras[i].horaEntrada,
  //     //       horaSalida: cuadrante.arraySemanalHoras[i].horaSalida,
  //     //       idPlan: new ObjectId().toString(),
  //     //     });
  //     //   } else arraySemanalHoras.push(null);

  //     //   bueno.arraySemanalHoras = arraySemanalHoras;
  //     //   return bueno;
  //     // });

  //     // return arrayBueno;
  //   } catch (err) {
  //     console.log(err);
  //     return { ok: false, message: err.message };
  //   }
  // }
}
