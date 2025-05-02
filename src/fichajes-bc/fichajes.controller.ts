import { Controller, Post, UseGuards, Get, Query, Body } from "@nestjs/common";
import { AuthGuard } from "../guards/auth.guard";
import { Fichajes } from "./fichajes.class";
import { SchedulerGuard } from "../guards/scheduler.guard";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { DateTime } from "luxon";
import { User } from "../decorators/get-user.decorator";
import { UserRecord } from "firebase-admin/auth";
import { GetFichajesPendientesRequestDto } from "./fichajes.dto";
import { Notificaciones } from "../notificaciones/notificaciones.class";

@Controller("fichajes")
export class FichajesController {
  constructor(
    private readonly fichajesInstance: Fichajes,
    private readonly trabajadoresInstance: TrabajadorService,
    private readonly notificaciones: Notificaciones,
  ) {}

  @UseGuards(AuthGuard)
  @Post("entrada")
  async entrada(
    @User() user: UserRecord,
    @Body() body: { latitud?: number; longitud?: number },
  ) {
    const usuarioCompleto =
      await this.trabajadoresInstance.getTrabajadorByAppId(user.uid);

    await this.fichajesInstance.nuevaEntrada(
      usuarioCompleto,
      body.latitud,
      body.longitud,
    );

    return true;
  }

  @UseGuards(AuthGuard)
  @Post("salida")
  async salida(
    @User() user: UserRecord,
    @Body() body: { latitud?: number; longitud?: number },
  ) {
    const usuarioCompleto =
      await this.trabajadoresInstance.getTrabajadorByAppId(user.uid);

    await this.fichajesInstance.nuevaSalida(
      usuarioCompleto,
      body.latitud,
      body.longitud,
    );
    return true;
  }

  @UseGuards(AuthGuard)
  @Post("inicioDescanso")
  async descanso(@User() user: UserRecord) {
    const usuarioCompleto =
      await this.trabajadoresInstance.getTrabajadorByAppId(user.uid);

    // // Desfichar: Requisito legal.
    // await this.fichajesInstance.nuevaSalida(usuarioCompleto);

    // Inicio descanso:
    const horaInicioDescanso = await this.fichajesInstance.nuevoInicioDescanso(
      usuarioCompleto,
    );

    const inicioFichaje = await this.fichajesInstance.getInicioFichaje(
      horaInicioDescanso,
      user.uid,
    );

    return {
      ok: true,
      inicioDescanso: horaInicioDescanso.toISO(),
      inicioFichaje: inicioFichaje.toISO(),
    };
  }

  @UseGuards(AuthGuard)
  @Post("finalDescanso")
  async finalDescanso(@User() user: UserRecord) {
    const usuarioCompleto =
      await this.trabajadoresInstance.getTrabajadorByAppId(user.uid);

    // Final descanso
    await this.fichajesInstance.nuevoFinalDescanso(usuarioCompleto);

    // // Fichaje entrada automático
    // await this.fichajesInstance.nuevaEntrada(usuarioCompleto);

    return true;
  }

  @UseGuards(AuthGuard)
  @Get("estado")
  async getEstado(@Query("date") dateString: string, @User() user: UserRecord) {
    const date = new Date(dateString);
    const result = await this.fichajesInstance.getEstado(user.uid, date);

    return result;
  }

  @UseGuards(AuthGuard)
  @Get("tiempoDescansoTotalDia")
  async tiempoDescansoTotalDia(@User() user: UserRecord) {
    const inicio = DateTime.now().startOf("day");
    const final = inicio.endOf("day");

    try {
      const tiempoDescanso =
        await this.fichajesInstance.getTiempoDescansoTotalDia(
          inicio,
          final,
          user.uid,
        );
      return tiempoDescanso;
    } catch (err) {
      console.log(err);
    }

    return 0;
  }

  @UseGuards(SchedulerGuard)
  @Post("sincroFichajes")
  async sincroFichajes() {
    try {
      await this.fichajesInstance.sincroFichajes();
      return { ok: true };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(SchedulerGuard)
  @Post("getFichajesBC")
  async getFichajesBC() {
    try {
      return {
        ok: true,
        data: await this.fichajesInstance.fusionarFichajesBC(),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("getNominas")
  async getNominas() {
    try {
      return {
        ok: true,
        data: await this.fichajesInstance.getNominas(),
      };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("fichajesByIdSql")
  async getFichajesByIdSql(
    @Query() { idSql, validado }: { idSql: number; validado: string },
  ) {
    try {
      if (!idSql && !validado) throw Error("Faltan parámetros");

      const validadoBoolean = validado == "true" ? true : false;

      const fichajes = await this.fichajesInstance.getFichajesByIdSql(
        Number(idSql),
        validadoBoolean,
      );

      return {
        ok: true,
        data: fichajes,
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("updateFichaje")
  async updateFichaje(@Body() { id, validado }) {
    try {
      // const validadoBoolean = validado == 'true' ? true : false;
      // Falta comprobación de quién puede enviar un anuncio, ahora
      // mismo cualquiera lo puede hacer.
      const respFichaje = await this.fichajesInstance.updateFichaje(
        id,
        validado,
      );
      if (respFichaje)
        return {
          ok: true,
        };
      throw Error("No se ha podido modificar el fichaje");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("misFichajes")
  async getMisFichajes(
    @Query() { fechaInicio, fechaFinal },
    @User() user: UserRecord,
  ) {
    try {
      if (!fechaInicio || !fechaFinal) throw Error("Faltan parámetros");

      fechaInicio = new Date(fechaInicio);
      fechaFinal = new Date(fechaFinal);

      return {
        ok: true,
        data: await this.fichajesInstance.getFichajesByUid(
          user.uid,
          fechaInicio,
          fechaFinal,
        ),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("sinValidar")
  async getSinValidar(@Query("uid") uid: string, @User() user: UserRecord) {
    try {
      // Usa el UID de la Coordinadora_A si lo recibe en la petición, sino usa el del usuario actual
      const uidParaConsultar = uid || user.uid;
      const arraySubordinados = await this.trabajadoresInstance.getSubordinados(
        uidParaConsultar,
      );

      return {
        ok: true,
        data: await this.fichajesInstance.getParesSinValidar(arraySubordinados),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("hayFichajesPendientes")
  async hayFichajesPendientes(@Body() req: GetFichajesPendientesRequestDto) {
    return await this.fichajesInstance.hayFichajesPendientes(
      req.arrayIds,
      DateTime.fromJSDate(req.fecha),
    );
  }

  @UseGuards(SchedulerGuard)
  @Post("validarFichajesAntiguos")
  async validarFichajesAntiguos() {
    return await this.fichajesInstance.validarFichajesAntiguos();
  }

  @UseGuards(AuthGuard)
  @Get("fichajesResto")
  async getFichajes(@Query() { idSql }: { idSql: number }) {
    try {
      if (!idSql) throw Error("Faltan parámetros");

      const fichajes = await this.fichajesInstance.getFichajes(Number(idSql));

      return {
        ok: true,
        data: fichajes,
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(SchedulerGuard)
  @Post("verificarFichajesYNotificar")
  async verificarFichajesYNotificar() {
    try {
      const hoy = DateTime.now().startOf("day"); // Obtener el día actual
      const horaActual = DateTime.now().hour;

      const horaEntrada = 9;
      const horaSalida = 18;

      // Roles a excluir
      const rolesExcluidos = new Set([
        "Tienda",
        "Dependienta",
        "Externo",
        "Coordinadora_A",
        "Coordinadora_B",
        "ExternoAdmin",
      ]);

      // Obtener todos los trabajadores
      const trabajadores = await this.trabajadoresInstance.getTrabajadores();

      // Filtrar trabajadores que no tienen los roles excluidos
      const trabajadoresFiltrados = trabajadores.filter(
        (trabajador) =>
          trabajador.idApp &&
          !trabajador.roles.some((rol) => rolesExcluidos.has(rol.name)),
      );

      // Obtener tokens FCM para los trabajadores filtrados
      const tokensMap = await Promise.all(
        trabajadoresFiltrados.map(async (trabajador) => {
          const token = await this.notificaciones.getFCMToken(trabajador.idApp);
          return { trabajador, token };
        }),
      );

      // Ejecutar notificaciones en paralelo para cada trabajador
      await Promise.all(
        tokensMap.map(async ({ trabajador, token }) => {
          if (!token || !token.token) {
            console.log(
              `No se encontró el token FCM para el trabajador con idApp: ${trabajador.idApp}`,
            );
            return;
          }

          // Obtener fichajes del día
          const fichajesHoy = await this.fichajesInstance.getFichajesByUid(
            trabajador.idApp,
            hoy.toJSDate(),
            hoy.endOf("day").toJSDate(),
          );

          const tieneEntrada = fichajesHoy.some(
            (fichaje) => fichaje.tipo === "ENTRADA",
          );
          const tieneSalida = fichajesHoy.some(
            (fichaje) => fichaje.tipo === "SALIDA",
          );

          // Verificar si no tiene entrada y la hora es >= 9
          if (!tieneEntrada && horaActual >= horaEntrada) {
            await this.notificaciones.sendNotificationToDevice(
              token.token,
              "Fichaje",
              "No tienes fichaje de entrada, recuerda fichar tu entrada",
              "/fichajes",
            );
          }

          // Verificar si tiene entrada pero no tiene salida y la hora es >= 18
          if (tieneEntrada && !tieneSalida && horaActual >= horaSalida) {
            await this.notificaciones.sendNotificationToDevice(
              token.token,
              "Fichaje",
              "Tienes un fichaje de entrada pero no de salida, recuerda fichar tu salida",
              "/fichajes",
            );
          }
        }),
      );

      return { ok: true, message: "Notificaciones enviadas si correspondía." };
    } catch (error) {
      console.log(error);
      return { ok: false, message: error.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("historialFichajesDelDia")
  async getHistorialFichajesDelDia(@Query("uid") uid: string) {
    const hoy = new Date();
    const inicio = new Date(hoy.setHours(0, 0, 0, 0));
    const fin = new Date(hoy.setHours(23, 59, 59, 999));

    return this.fichajesInstance.getFichajesByUid(uid, inicio, fin);
  }
}
