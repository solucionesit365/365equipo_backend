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
import { TCuadrante, TRequestCuadrante } from "./cuadrantes.interface";
import { SchedulerGuard } from "../scheduler/scheduler.guard";
import { AuthService } from "../firebase/auth";
import { Trabajador } from "../trabajadores/trabajadores.class";
import { Notificaciones } from "src/notificaciones/notificaciones.class";
import { DateTime } from "luxon";
import { ObjectId } from "mongodb";

@Controller("cuadrantes")
export class CuadrantesController {
  constructor(
    private readonly notificaciones: Notificaciones,
    private readonly authInstance: AuthService,
    private readonly tokenService: TokenService,
    private readonly cuadrantesInstance: Cuadrantes,
    private readonly trabajadoresInstance: Trabajador,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async getCuadrantes(
    @Query() { fecha, idTienda }: { fecha: string; idTienda?: string },
    @Headers("authorization") authHeader: string,
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      const usuario = await this.authInstance.getUserWithToken(token);

      if (!fecha) throw Error("Faltan datos");

      const tipoEmpleado = this.cuadrantesInstance.getRole(usuario);
      let cuadrantes: TCuadrante[] = [];

      if (tipoEmpleado === "DEPENDIENTA") {
        cuadrantes = await this.cuadrantesInstance.getCuadranteDependienta(
          usuario.id,
          DateTime.fromJSDate(new Date(fecha)),
        );
      }

      if (tipoEmpleado === "COORDINADORA") {
        const arrayEquipo = await this.trabajadoresInstance.getSubordinadosById(
          usuario.id,
        );
        const arrayIdEquipo = arrayEquipo.map(
          (trabajadorSubordinado) => trabajadorSubordinado.id,
        );

        cuadrantes = await this.cuadrantesInstance.getCuadranteCoordinadora(
          usuario.id,
          arrayIdEquipo,
          DateTime.fromJSDate(new Date(fecha)),
        );
      }

      if (tipoEmpleado === "SUPERVISORA" && Number(idTienda)) {
        cuadrantes = await this.cuadrantesInstance.getCuadranteSupervisora(
          Number(idTienda),
          DateTime.fromJSDate(new Date(fecha)),
        );
      }

      return {
        ok: true,
        data: cuadrantes,
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("individual")
  @UseGuards(AuthGuard)
  async getCuadrantesIndividual(
    @Query()
    { idTrabajador, fecha }: { fecha: string; idTrabajador: string },
    @Headers("authorization") authHeader: string,
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      const usuario = await this.authInstance.getUserWithToken(token);

      if (!fecha || !idTrabajador) throw Error("Faltan datos");

      if (usuario.coordinadora && usuario.idTienda) {
        const fechaInicio = DateTime.fromJSDate(new Date(fecha)).startOf(
          "week",
        );
        const fechaFinal = fechaInicio.endOf("week");

        return {
          ok: true,
          data: await this.cuadrantesInstance.getCuadrantesIndividual(
            Number(idTrabajador),
            fechaInicio,
            fechaFinal,
          ),
        };
      }
      throw Error("Opción no disponible para este tipo de empled@");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("getNewId")
  @UseGuards(AuthGuard)
  getNewId() {
    return new ObjectId();
  }

  @Post("borrarTurno")
  @UseGuards(AuthGuard)
  async borrarTurno(@Body() { idTurno }) {
    try {
      if (idTurno) {
        return {
          ok: await this.cuadrantesInstance.borrarTurno(idTurno),
        };
      } else throw Error("Faltan parámetros");
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
  async getTiendas1Semana(@Query() { fecha }: { fecha: string }) {
    try {
      if (!fecha) throw Error("Faltan datos");
      return {
        ok: true,
        data: await this.cuadrantesInstance.getTiendas1Semana(
          DateTime.fromJSDate(new Date(fecha)),
        ),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  //Todas las semanas 1 tienda
  @Get("getTiendaTodasSemanas")
  @UseGuards(AuthGuard)
  async getSemanas1Tienda(@Query() { idTienda }: { idTienda: number }) {
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

  // //1Tienda 1 Semana
  // @Get("getTiendaSemana")
  // @UseGuards(AuthGuard)
  // async getTiendaSemana(
  //   @Query()
  //   { idTienda, fecha }: { idTienda: number; fecha: string },
  // ) {
  //   try {
  //     if (!idTienda && !fecha) throw Error("Faltan datos");
  //     return {
  //       ok: true,
  //       data: await this.cuadrantesInstance.getCuadrantes(
  //         Number(idTienda),
  //         DateTime.fromJSDate(new Date(fecha)),

  //       ),
  //     };
  //   } catch (error) {
  //     console.log(error);
  //     return { ok: false, message: error.message };
  //   }
  // }

  //obtener cuadrantes por semana y trabajador:
  @Get("cuadranteSemanaTrabajador")
  @UseGuards(AuthGuard)
  async getCuadranteSemanaTrabajador(
    @Query()
    {
      idTrabajador,
      fecha,
    }: {
      idTrabajador: number;
      fecha: string;
    },
    @Headers("authorization") authHeader: string,
  ) {
    try {
      if (!idTrabajador && !fecha) throw Error("Faltan datos");
      return {
        ok: true,
        data: await this.cuadrantesInstance.getCuadranteSemanaTrabajador(
          Number(idTrabajador),
          DateTime.fromJSDate(new Date(fecha)),
        ),
      };
    } catch (error) {
      console.log(error);
      return { ok: false, message: error.message };
    }
  }

  private convertToLuxon = (
    hourString: string,
    // dayOffset: number,
  ): DateTime => {
    // Obtener el lunes de la semana actual
    // const mondayThisWeek = DateTime.now().startOf("week").plus({ days: 1 });

    // const [hour, minute] = hourString.split(":").map(Number);

    // return mondayThisWeek.plus({
    //   days: dayOffset,
    //   hours: hour,
    //   minutes: minute,
    // });
    return DateTime.fromJSDate(new Date(hourString));
  };

  @Post("saveCuadrante")
  @UseGuards(AuthGuard)
  async saveCuadrante(
    @Body() reqCuadrante: TRequestCuadrante,
    @Headers("authorization") authHeader: string,
  ) {
    try {
      if (!reqCuadrante) throw Error("Faltan datos");
      const token = this.tokenService.extract(authHeader);
      const usuario = await this.authInstance.getUserWithToken(token);
      const trabajadorEditado =
        await this.trabajadoresInstance.getTrabajadorBySqlId(
          reqCuadrante.idTrabajador,
        );

      if (usuario.coordinadora && usuario.idTienda) {
        const fechaInicio = DateTime.fromJSDate(
          new Date(reqCuadrante.fecha),
        ).startOf("week");
        const fechaFinal = fechaInicio.endOf("week");

        // Para saber si hay que actualizar o insertar nuevo
        const oldCuadrante =
          await this.cuadrantesInstance.getCuadrantesIndividual(
            reqCuadrante.idTrabajador,
            fechaInicio,
            fechaFinal,
          );

        const newArraySemanalHoras: TRequestCuadrante["arraySemanalHoras"] =
          reqCuadrante.arraySemanalHoras.map((day) => ({
            ...day,
            horaEntrada: this.convertToLuxon(day.horaEntrada as string),
            horaSalida: this.convertToLuxon(day.horaSalida as string),
          }));

        reqCuadrante.arraySemanalHoras = newArraySemanalHoras;

        const cuadrantesDiarios: TCuadrante[] = [];
        // Creo los cuadrantes diarios a partir del arraySemanal:
        for (let i = 0; i < reqCuadrante.arraySemanalHoras.length; i += 1) {
          if (
            (reqCuadrante.arraySemanalHoras[i].horaEntrada as DateTime).equals(
              reqCuadrante.arraySemanalHoras[i].horaSalida as DateTime,
            )
          )
            continue;

          cuadrantesDiarios.push({
            _id: reqCuadrante.arraySemanalHoras[i].idCuadrante
              ? new ObjectId(reqCuadrante.arraySemanalHoras[i].idCuadrante)
              : null, // Se creará al insertar con bulkwrite
            idTrabajador: reqCuadrante.idTrabajador,
            idPlan: reqCuadrante.arraySemanalHoras[i].idPlan
              ? reqCuadrante.arraySemanalHoras[i].idPlan
              : new ObjectId().toString(),
            idTienda: reqCuadrante.arraySemanalHoras[i].idTienda
              ? reqCuadrante.arraySemanalHoras[i].idTienda
              : reqCuadrante.idTiendaDefault,
            inicio: (
              reqCuadrante.arraySemanalHoras[i].horaEntrada as DateTime
            ).toJSDate(),
            final: (
              reqCuadrante.arraySemanalHoras[i].horaSalida as DateTime
            ).toJSDate(),
            nombre: trabajadorEditado.nombreApellidos,
            totalHoras: Math.abs(
              (reqCuadrante.arraySemanalHoras[i].horaEntrada as DateTime).diff(
                reqCuadrante.arraySemanalHoras[i].horaSalida as DateTime,
                "hours",
              ).hours,
            ),
            enviado: false,
            historialPlanes: [],
            horasContrato:
              (await this.trabajadoresInstance.getHorasContratoById(
                reqCuadrante.idTrabajador,
                fechaInicio,
              )) as number,
            ausencia: null,
            borrable: reqCuadrante.arraySemanalHoras[i].borrable ? true : false,
          });
        }

        /* Pasar a individual */

        if (
          await this.cuadrantesInstance.saveCuadrante(
            cuadrantesDiarios,
            oldCuadrante,
          )
        ) {
          const trabajadorID =
            await this.trabajadoresInstance.getTrabajadorBySqlId(
              reqCuadrante.idTrabajador,
            );

          this.notificaciones.newInAppNotification({
            uid: trabajadorID.idApp,
            titulo: "CUADRANTE TIENDA",
            mensaje: `Se ha creado tu horario de la semana ${fechaInicio.weekNumber}`,
            leido: false,
            creador: "SISTEMA",
          });
          return { ok: true };
        }
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

  // @Post("copiar")
  // @UseGuards(AuthGuard)
  // async copiarSemana(
  //   @Headers("authorization") authHeader: string,
  //   @Body() { semanaOrigen, semanaDestino, yearOrigen, yearDestino, idTienda },
  // ) {
  //   try {
  //     if (
  //       !semanaOrigen ||
  //       !semanaDestino ||
  //       (!yearOrigen && !yearDestino && !idTienda)
  //     )
  //       throw Error("Faltan parámetros");

  //     const token = this.tokenService.extract(authHeader);
  //     await this.authInstance.verifyToken(token);

  //     const usuario = await this.authInstance.getUserWithToken(token);

  //     if (await this.trabajadoresInstance.esCoordinadora(usuario.uid)) {
  //       return {
  //         ok: true,
  //         data: await this.cuadrantesInstance.(
  //           Number(semanaOrigen),
  //           Number(semanaDestino),
  //           Number(yearOrigen),
  //           Number(yearDestino),
  //           Number(idTienda),
  //         ),
  //       };
  //     }
  //     throw Error("No tienes permisos para realizar esta acción");
  //   } catch (err) {
  //     console.log(err);
  //     return { ok: false, message: err.message };
  //   }
  // }
}
