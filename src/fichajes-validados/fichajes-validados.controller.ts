import { Controller, Post, Get, Body, Query, UseGuards } from "@nestjs/common";
import { FichajesValidadosService } from "./fichajes-validados.class";
import {
  FichajeValidadoDto,
  GetAllFichajesValidadosRequestDto,
  GetResumenRequestDto,
  GetSemanasFichajesPagarRequestDto,
  GetTiendaDiaRequestDto,
  GetTiendaRangoRequestDto,
} from "./fichajes-validados.dto";
import { Notificaciones } from "../notificaciones/notificaciones.class";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { AuthGuard } from "../guards/auth.guard";
import { SchedulerGuard } from "../guards/scheduler.guard";
import { DateTime } from "luxon";

@Controller("fichajes-validados")
export class FichajesValidadosController {
  constructor(
    private readonly trabajador: TrabajadorService,
    private readonly notificaciones: Notificaciones,
    private readonly fichajesValidadosInstance: FichajesValidadosService,
  ) {}

  @UseGuards(AuthGuard)
  @Post("addFichajeValidado")
  async addFichajeValidado(@Body() fichajeValidado: FichajeValidadoDto) {
    try {
      // Convertir fichajeEntrada/ fichajeSalida y cuadrantes.inicio y final a objetos Date, si son strings
      if (typeof fichajeValidado.fichajeEntrada === "string") {
        fichajeValidado.fichajeEntrada = new Date(
          fichajeValidado.fichajeEntrada,
        );
      }
      if (typeof fichajeValidado.fichajeSalida === "string") {
        fichajeValidado.fichajeSalida = new Date(fichajeValidado.fichajeSalida);
      }

      if (typeof fichajeValidado.cuadrante.inicio === "string") {
        fichajeValidado.cuadrante.inicio = new Date(
          fichajeValidado.cuadrante.inicio,
        );
      }
      if (typeof fichajeValidado.cuadrante.final === "string") {
        fichajeValidado.cuadrante.final = new Date(
          fichajeValidado.cuadrante.final,
        );
      }

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

  @UseGuards(AuthGuard)
  @Get("getFichajesValidados")
  async getFichajesValidados(
    @Query() { idTrabajador }: { idTrabajador: number },
  ) {
    try {
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

  @UseGuards(AuthGuard)
  @Post("actualizarValidados")
  async updateFichajesValidados(
    @Body() FichajesValidadosService: FichajeValidadoDto,
  ) {
    try {
      if (
        await this.fichajesValidadosInstance.updateFichajesValidados(
          FichajesValidadosService,
        )
      ) {
        const fichajeTrabajador = await this.trabajador.getTrabajadorBySqlId(
          FichajesValidadosService.idTrabajador,
        );
        if (fichajeTrabajador.idApp) {
          const userToken = await this.notificaciones.getFCMToken(
            fichajeTrabajador.idApp,
          );
          if (userToken && userToken.token) {
            if (
              FichajesValidadosService.aPagar &&
              FichajesValidadosService.horasPagar.estadoValidado == "PENDIENTE"
            ) {
              try {
                await this.notificaciones.sendNotificationToDevice(
                  userToken.token,
                  "Solicitud Horas a Pagar",
                  `Se ha solicitado ${FichajesValidadosService.horasPagar.total}h a pagar`,
                  "/",
                );

                if (
                  FichajesValidadosService.horasPagar.estadoValidado !==
                  "PENDIENTE"
                ) {
                  await this.notificaciones.sendNotificationToDevice(
                    userToken.token,
                    "Pago de horas",
                    `${FichajesValidadosService.horasPagar.estadoValidado} ${FichajesValidadosService.horasPagar.total}h`,
                    "/",
                  );
                }
              } catch (error) {
                console.error("Error al enviar la notificación:", error);
              }
            }
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

  @UseGuards(AuthGuard)
  @Get("getFichajesPagar")
  async getFichajesPagar(
    @Query()
    {
      idResponsable,
      aPagar,
      fecha,
    }: {
      idResponsable: number;
      aPagar: string;
      fecha: any;
    },
  ) {
    try {
      const aPagarBoolean = aPagar == "true" ? true : false;

      const parsedDate = DateTime.fromISO(fecha);

      const respValidados =
        await this.fichajesValidadosInstance.getFichajesPagar(
          Number(idResponsable),
          aPagarBoolean,
          parsedDate,
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

  @UseGuards(AuthGuard)
  @Get("getAllFichajesPagar")
  async getAllFichajesPagar(
    @Query()
    { aPagar }: { aPagar: string },
  ) {
    try {
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

  @UseGuards(AuthGuard)
  @Get("getAllIdResponsableFichajesPagar")
  async getAllIdResponsableFichajesPagar(
    @Query()
    { idResponsable }: { idResponsable: number },
  ) {
    try {
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

  @UseGuards(AuthGuard)
  @Get("getSemanasFichajesPagar")
  async getSemanasFichajesPagar(
    @Query() req: GetSemanasFichajesPagarRequestDto,
  ) {
    try {
      const respValidados =
        await this.fichajesValidadosInstance.getSemanasFichajesPagar(
          DateTime.fromJSDate(req.diaEntreSemana),
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

  @UseGuards(AuthGuard)
  @Get("getAllFichajesValidados")
  async getAllFichajes(@Query() req: GetAllFichajesValidadosRequestDto) {
    try {
      const respAllFichajes =
        await this.fichajesValidadosInstance.getAllFichajesValidados(req.fecha);

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

  @UseGuards(AuthGuard)
  @Get("getTiendaDia")
  async getTiendaDia(@Query() req: GetTiendaDiaRequestDto) {
    try {
      const respFichajesV = await this.fichajesValidadosInstance.getTiendaDia(
        req.tienda,
        req.dia,
      );
      if (respFichajesV.length > 0) {
        return {
          ok: true,
          data: respFichajesV,
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

  @UseGuards(AuthGuard)
  @Get("getTiendaRango")
  async getTiendaRango(@Query() req: GetTiendaRangoRequestDto) {
    try {
      const tiendasNumeros = req.tiendas.map(Number);
      const respFichajesV = await this.fichajesValidadosInstance.getTiendaRango(
        tiendasNumeros,
        req.fechaInicio,
        req.fechaFin,
      );
      if (respFichajesV.length > 0) {
        return {
          ok: true,
          data: respFichajesV,
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

  @UseGuards(AuthGuard)
  @Get("getResumen")
  async getResumen(@Query() req: GetResumenRequestDto) {
    try {
      return {
        ok: true,
        data: await this.fichajesValidadosInstance.resumenSemana(
          req.fechaEntreSemana,
          req.idTienda,
        ),
      };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  // ESTÁ PENDIENTE 25/10/2023
  @UseGuards(SchedulerGuard)
  @Post("sincronizarConHit")
  async sincronizarFichajesValidados() {
    try {
      // const pendientesEnvio =
      //   await this.fichajesValidadosInstance.getPendientesEnvio();

      // const pool = await getConnectionPoolHit(); // Abre una conexión
      // const fichajesSincronizados: string[] = []; // Para guardar los IDs de fichajes sincronizados correctamente

      // for (let fichaje of pendientesEnvio) {
      //   const consultaSQL = this.formatoConsultaSQL(fichaje);
      //   const resultSQL = await pool.request().query(consultaSQL);

      //   if (resultSQL && resultSQL.rowsAffected[0] > 0) {
      //     fichajesSincronizados.push(fichaje._id!);
      //   }
      // }

      // // Una vez todos los fichajes están sincronizados, actualiza MongoDB
      // if (fichajesSincronizados.length > 0) {
      //   await this.fichajesValidadosInstance.marcarComoEnviado(
      //     fichajesSincronizados,
      //   );
      // }

      // pool.close(); // Cierra la conexión
      return { ok: true, message: "Sincronización completa." };
    } catch (err) {
      console.log(err);
      return { ok: false, error: err.message };
    }
  }

  // @UseGuards(SchedulerGuard)
  @Post("NotificarFichajesPendientesSupervisoras")
  async notificarFichajesPendientesSupervisoras() {
    const fechaActual = DateTime.now();

    // Obtener todos los trabajadores que son supervisoras y llevan equipo
    const supervisorasConEquipo = await this.trabajador.getTrabajadores();

    // Filtrar las supervisoras que llevan equipo
    const usuariosSupervisora = supervisorasConEquipo.filter(
      (usuario) =>
        usuario.roles.some((rol) => rol.name === "Supervisora") &&
        usuario.llevaEquipo,
    );

    const notificacionesPromises = usuariosSupervisora.map(
      async (supervisora) => {
        // Obtener fichajes pendientes de validar de su equipo
        const fichajesPendientes =
          await this.fichajesValidadosInstance.getFichajesPagar(
            supervisora.id,
            true,
            fechaActual,
          );
        console.log(fichajesPendientes);

        console.log(
          `Fichajes pendientes para la supervisora ${supervisora.nombreApellidos}: ${fichajesPendientes.length}`,
        );

        // if (fichajesPendientes.length > 0) {
        //   const userToken = await this.notificaciones.getFCMToken(
        //     supervisora.idApp,
        //   );

        //   if (userToken && userToken.token) {
        //     try {
        //       await this.notificaciones.sendNotificationToDevice(
        //         userToken.token,
        //         "Fichajes Pendientes",
        //         `Tienes ${fichajesPendientes.length} fichajes pendientes de validar.`,
        //         "/fichajes-pendientes", // ruta en tu app
        //       );
        //     } catch (error) {
        //       console.log("Error al enviar notificación:", error);
        //     }
        //   }
        // }
      },
    );

    await Promise.all(notificacionesPromises);

    return { ok: true, message: "Notificaciones enviadas correctamente" };
  }
}
