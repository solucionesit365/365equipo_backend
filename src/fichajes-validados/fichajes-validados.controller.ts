import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  Query,
  UseGuards,
} from "@nestjs/common";
import { TokenService } from "../get-token/get-token.service";
import { FichajesValidados } from "./fichajes-validados.class";
import { FichajeValidadoDto } from "./fichajes-validados.interface";
import { AuthService } from "../firebase/auth";
import { Notificaciones } from "src/notificaciones/notificaciones.class";
import { Trabajador } from "src/trabajadores/trabajadores.class";
import { AuthGuard } from "../auth/auth.guard";

@Controller("fichajes-validados")
export class FichajesValidadosController {
  constructor(
    private readonly trabajador: Trabajador,
    private readonly notificaciones: Notificaciones,
    private readonly authInstance: AuthService,
    private readonly tokenService: TokenService,
    private readonly fichajesValidadosInstance: FichajesValidados,
  ) {}

  @Post("addFichajeValidado")
  async addFichajeValidado(
    @Body() fichajeValidado: FichajeValidadoDto,
    @Headers("authorization") authHeader: string,
  ) {
    try {
      if (!fichajeValidado.idTrabajador) throw Error("Faltan parametros");
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      if (
        await this.fichajesValidadosInstance.addFichajesValidados(
          fichajeValidado,
        )
      )
        return {
          ok: true,
        };
      throw Error("No se ha podido insertar el anuncio");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("getFichajesValidados")
  async getFichajesValidados(
    @Headers("authorization") authHeader: string,
    @Query() { idTrabajador }: { idTrabajador: number },
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      const respValidados =
        await this.fichajesValidadosInstance.getFichajesValidados(
          Number(idTrabajador),
        );
      if (respValidados.length > 0) {
        return {
          ok: true,
          data: respValidados,
        };
      }
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Post("actualizarValidados")
  async updateFichajesValidados(
    @Headers("authorization") authHeader: string,
    @Body() FichajesValidados: FichajeValidadoDto,
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      if (
        await this.fichajesValidadosInstance.updateFichajesValidados(
          FichajesValidados,
        )
      ) {
        const fichajeTrabajador = await this.trabajador.getTrabajadorBySqlId(
          FichajesValidados.idTrabajador,
        );
        if (
          FichajesValidados.aPagar &&
          FichajesValidados.horasPagar.estadoValidado == "PENDIENTE"
        ) {
          this.notificaciones.newInAppNotification({
            uid: fichajeTrabajador.idApp,
            titulo: "Solicitud Horas a Pagar",
            mensaje: `Se ha solicitado ${FichajesValidados.horasPagar.total}h a pagar`,
            leido: false,
            creador: "SISTEMA",
          });
        }
        if (FichajesValidados.horasPagar.estadoValidado != "PENDIENTE") {
          {
            this.notificaciones.newInAppNotification({
              uid: fichajeTrabajador.idApp,
              titulo: "Pago de horas",
              mensaje: `${FichajesValidados.horasPagar.estadoValidado} ${FichajesValidados.horasPagar.total}h `,
              leido: false,
              creador: "SISTEMA",
            });
          }
        }
        return {
          ok: true,
        };
      }
      throw Error("No se ha podido modificar fichaje validado");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("getFichajesPagar")
  async getFichajesPagar(
    @Headers("authorization") authHeader: string,
    @Query()
    { idResponsable, aPagar }: { idResponsable: number; aPagar: string },
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      const aPagarBoolean = aPagar == "true" ? true : false;

      const respValidados =
        await this.fichajesValidadosInstance.getFichajesPagar(
          Number(idResponsable),
          aPagarBoolean,
        );
      if (respValidados.length > 0) {
        return {
          ok: true,
          data: respValidados,
        };
      }
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("getAllFichajesPagar")
  async getAllFichajesPagar(
    @Headers("authorization") authHeader: string,
    @Query()
    { aPagar }: { aPagar: string },
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      const aPagarBoolean = aPagar == "true" ? true : false;

      const respValidados =
        await this.fichajesValidadosInstance.getAllFichajesPagar(aPagarBoolean);
      if (respValidados.length > 0) {
        return {
          ok: true,
          data: respValidados,
        };
      }
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("getAllIdResponsableFichajesPagar")
  async getAllIdResponsableFichajesPagar(
    @Headers("authorization") authHeader: string,
    @Query()
    { idResponsable }: { idResponsable: number },
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      const respValidados =
        await this.fichajesValidadosInstance.getAllIdResponsable(
          Number(idResponsable),
        );
      if (respValidados.length > 0) {
        return {
          ok: true,
          data: respValidados,
        };
      } else {
        return {
          ok: false,
          data: [],
          message: "No tiene fichajes validados",
        };
      }
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("getSemanasFichajesPagar")
  async getSemanasFichajesPagar(
    @Headers("authorization") authHeader: string,
    @Query()
    { semana }: { semana: number },
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      const respValidados =
        await this.fichajesValidadosInstance.getSemanasFichajesPagar(
          Number(semana),
        );
      if (respValidados.length > 0) {
        return {
          ok: true,
          data: respValidados,
        };
      } else {
        return {
          ok: false,
          data: [],
          message: "No tiene fichajes validados en esta semana",
        };
      }
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("getAllFichajesValidados")
  async getAllFichajes(@Headers("authorization") authHeader: string) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      const respAllFichajes =
        await this.fichajesValidadosInstance.getAllFichajesValidados();

      if (respAllFichajes.length > 0) {
        return {
          ok: true,
          data: respAllFichajes,
        };
      } else {
        return {
          ok: false,
          data: [],
        };
      }
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  // Cuadrantes 2.0
  @Get("getResumen")
  @UseGuards(AuthGuard)
  async getResumen(@Query() params) {
    try {
      if (!params.fechaBusqueda || !params.idTienda)
        throw Error("Faltan parámetros");

      const fechaBusqueda = new Date(params.fechaBusqueda);

      return {
        ok: true,
        data: await this.fichajesValidadosInstance.resumenSemana(
          fechaBusqueda,
          Number(params.idTienda),
        ),
      };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }
}
