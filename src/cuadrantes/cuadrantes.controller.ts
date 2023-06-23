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
import { Trabajador } from "../trabajadores/trabajadores.class";
import { Notificaciones } from "src/notificaciones/notificaciones.class";

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
    @Query() { semana, year }: { semana: string; year: string },
    @Headers("authorization") authHeader: string,
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      const usuario = await this.authInstance.getUserWithToken(token);

      if (!semana || !year) throw Error("Faltan datos");

      if (usuario.idTienda) {
        return {
          ok: true,
          data: await this.cuadrantesInstance.getCuadrantes(
            usuario.idTienda,
            Number(semana),
            Number(year),
            usuario.id,
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
    @Query() { semana, year }: { semana: string; year: string },
    @Headers("authorization") authHeader: string,
  ) {
    try {
      if (!semana || !year) throw Error("Faltan datos");
      return {
        ok: true,
        data: await this.cuadrantesInstance.getTiendas1Semana(
          Number(semana),
          Number(year),
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
      year,
    }: {
      idTienda: number;
      semana: number;
      year: number;
    },
    @Headers("authorization") authHeader: string,
  ) {
    try {
      if (!idTienda && !semana && !year) throw Error("Faltan datos");
      return {
        ok: true,
        data: await this.cuadrantesInstance.getCuadrantes(
          Number(idTienda),
          Number(semana),
          Number(year),
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
        const oldCuadrante =
          await this.cuadrantesInstance.getCuadrantesIndividual(
            cuadrante.idTienda,
            cuadrante.idTrabajador,
            cuadrante.semana,
            cuadrante.year,
          );
        cuadrante.idTienda = usuario.idTienda;

        const notiCuadrante = await this.cuadrantesInstance.saveCuadrante(
          cuadrante,
          oldCuadrante,
        );
        if (notiCuadrante) {
          const trabajadorID =
            await this.trabajadoresInstance.getTrabajadorBySqlId(
              cuadrante.idTrabajador,
            );

          this.notificaciones.newInAppNotification({
            uid: trabajadorID.idApp,
            titulo: "CUADRANTE TIENDA",
            mensaje: `Se ha creado tu horario de la semana ${cuadrante.semana}`,
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

  @Post("copiar")
  @UseGuards(AuthGuard)
  async copiarSemana(
    @Headers("authorization") authHeader: string,
    @Body() { semanaOrigen, semanaDestino, yearOrigen, yearDestino, idTienda },
  ) {
    try {
      if (
        !semanaOrigen ||
        !semanaDestino ||
        (!yearOrigen && !yearDestino && !idTienda)
      )
        throw Error("Faltan parámetros");

      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      const usuario = await this.authInstance.getUserWithToken(token);

      if (await this.trabajadoresInstance.esCoordinadora(usuario.uid)) {
        return {
          ok: true,
          data: await this.cuadrantesInstance.copiarCuadrante(
            Number(semanaOrigen),
            Number(semanaDestino),
            Number(yearOrigen),
            Number(yearDestino),
            Number(idTienda),
          ),
        };
      }
      throw Error("No tienes permisos para realizar esta acción");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
