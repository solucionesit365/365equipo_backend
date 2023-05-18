import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Headers,
  Query,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { TokenService } from "../get-token/get-token.service";
import { Cuadrantes } from "./cuadrantes.class";
import { TCuadrante } from "./cuadrantes.interface";
import { SchedulerGuard } from "../scheduler/scheduler.guard";
import * as moment from "moment";
import { AuthService } from "../firebase/auth";

@Controller("cuadrantes")
export class CuadrantesController {
  constructor(
    private readonly authInstance: AuthService,
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
      const usuario = await this.authInstance.getUserWithToken(token);

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
    @Query()
    {
      semana,
      idTrabajador,
      year,
    }: { semana: string; idTrabajador: string; year: number },
    @Headers("authorization") authHeader: string,
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      const usuario = await this.authInstance.getUserWithToken(token);

      if (!semana || !idTrabajador) throw Error("Faltan datos");

      if (usuario.coordinadora && usuario.idTienda) {
        return {
          ok: true,
          data: await this.cuadrantesInstance.getCuadrantesIndividual(
            usuario.idTienda,
            Number(idTrabajador),
            Number(semana),
            year,
          ),
        };
      }
      throw Error("Opción no disponible para este tipo de empled@");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("getTodos")
  @UseGuards(AuthGuard)
  async getAllCuadrantes(@Headers("authorization") authHeader: string) {
    try {
      return {
        ok: true,
        data: await this.cuadrantesInstance.getTodo(),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  //Todas las tiendas 1 semana
  @Get("getTiendasUnaSemana")
  @UseGuards(AuthGuard)
  async getTiendas1Semana(
    @Query() { semana }: { semana: number },
    @Headers("authorization") authHeader: string,
  ) {
    try {
      if (!semana) throw Error("Faltan datos");
      return {
        ok: true,
        data: await this.cuadrantesInstance.getTiendas1Semana(Number(semana)),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  //Todas las semanas 1 tienda
  @Get("getTiendaTodasSemanas")
  @UseGuards(AuthGuard)
  async getSemanas1Tienda(
    @Query() { idTienda }: { idTienda: number },
    @Headers("authorization") authHeader: string,
  ) {
    try {
      if (!idTienda) throw Error("Faltan datos");
      return {
        ok: true,
        data: await this.cuadrantesInstance.getSemanas1Tienda(Number(idTienda)),
      };
    } catch (error) {
      console.log(error);
      return { ok: false, message: error.message };
    }
  }

  //1Tienda 1 Semana
  @Get("getTiendaSemana")
  @UseGuards(AuthGuard)
  async getTiendaSemana(
    @Query()
    {
      idTienda,
      semana,
    }: {
      idTienda: number;
      semana: number;
    },
    @Headers("authorization") authHeader: string,
  ) {
    try {
      console.log(idTienda + semana);

      if (!idTienda && !semana) throw Error("Faltan datos");
      return {
        ok: true,
        data: await this.cuadrantesInstance.getCuadrantes(
          Number(idTienda),
          Number(semana),
        ),
      };
    } catch (error) {
      console.log(error);
      return { ok: false, message: error.message };
    }
  }
  //obtener cuadrantes por semana y trabajador:

  @Get("cuadranteSemanaTrabajador")
  @UseGuards(AuthGuard)
  async getCuadranteSemanaTrabajador(
    @Query()
    {
      idTrabajador,
      semana,
    }: {
      idTrabajador: number;
      semana: number;
    },
    @Headers("authorization") authHeader: string,
  ) {
    try {
      if (!idTrabajador && !semana) throw Error("Faltan datos");
      return {
        ok: true,
        data: await this.cuadrantesInstance.getCuadranteSemanaTrabajador(
          Number(idTrabajador),
          Number(semana),
        ),
      };
    } catch (error) {
      console.log(error);
      return { ok: false, message: error.message };
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
      const usuario = await this.authInstance.getUserWithToken(token);

      if (usuario.coordinadora && usuario.idTienda) {
        // cuadrante.idTienda = usuario.idTienda;
        // cuadrante.enviado = false;
        const oldCuadrante =
          await this.cuadrantesInstance.getCuadrantesIndividual(
            usuario.idTienda,
            cuadrante.idTrabajador,
            cuadrante.semana,
            cuadrante.year,
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

  @Post("sincronizarConHit")
  @UseGuards(SchedulerGuard)
  async sincronizarConHit() {
    try {
      return {
        ok: true,
        data: await this.cuadrantesInstance.sincronizarConHit(),
      };
    } catch (err) {
      console.log(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: "Error interno del servidor",
          message: err.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("testSemanas")
  testSemanas() {
    const fechaInicio = moment("03/04/2023", "DD/MM/YYYY");
    const fechaFinal = moment("08/05/2023", "DD/MM/YYYY");

    return this.cuadrantesInstance.semanasEnRango({
      comentario: "",
      tipo: "BAJA",
      idUsuario: 3608,
      fechaFinal: fechaFinal.toDate(),
      fechaInicio: fechaInicio.toDate(),
      arrayParciales: [],
    });
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
