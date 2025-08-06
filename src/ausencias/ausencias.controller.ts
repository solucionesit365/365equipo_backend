import { Body, Controller, Post, UseGuards, Get, Query } from "@nestjs/common";
import { AusenciasService } from "./ausencias.class";
import { AuthGuard } from "../guards/auth.guard";
import { DateTime } from "luxon";
import { LoggerService } from "../logger/logger.service";
import { CrearAusenciaDto, GetAusenciasTrabajadorDto } from "./ausencias.dto";
import { CompleteUser } from "../decorators/getCompleteUser.decorator";
import { Trabajador } from "@prisma/client";
import { UserRecord } from "firebase-admin/auth";
import { User } from "../decorators/get-user.decorator";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { ObjectId } from "mongodb";
import { SchedulerGuard } from "src/guards/scheduler.guard";

@Controller("ausencias")
export class AusenciasController {
  constructor(
    private readonly ausenciasInstance: AusenciasService,
    private readonly loggerService: LoggerService,
    private readonly trabajadores: TrabajadorService,
  ) {}

  @UseGuards(AuthGuard)
  @Post("nueva")
  async addAusencia(
    @Body() req: CrearAusenciaDto,
    @CompleteUser() user: Trabajador,
  ) {
    try {
      const inicio = DateTime.fromISO(req.fechaInicio).toJSDate();
      const final = req.fechaFinal
        ? DateTime.fromISO(req.fechaFinal).toJSDate()
        : null;
      const revision = req.fechaRevision
        ? DateTime.fromISO(req.fechaRevision).toJSDate()
        : null;

      const ausencia = await this.ausenciasInstance.nuevaAusencia(
        req.idUsuario,
        req.nombre,
        req.dni,
        req.tipo,
        req.horasContrato,
        req.tienda,
        inicio,
        final,
        revision,
        req.comentario,
        req.completa,
        req.horas,
      );

      this.loggerService.create({
        action: "Crea una ausencia",
        name: `${user.nombreApellidos} para ${req.nombre}`,
        extraData: ausencia,
      });

      return {
        ok: true,
        data: ausencia,
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("deleteAusencia")
  async deleteAusencia(@Body() { idAusencia }, @User() user: UserRecord) {
    try {
      //obtener la ausencia que se va a eliminar para poder usar sus propiedades
      const ausenciaToDelete = await this.ausenciasInstance.getAusenciaById(
        new ObjectId(idAusencia),
      );
      if (!ausenciaToDelete) {
        throw new Error("Ausencia no encontrada");
      }

      // Eliminar la ausencia
      const respAusencias = await this.ausenciasInstance.deleteAusencia(
        idAusencia,
      );

      if (respAusencias) {
        // Obtener el nombre del usuario autenticado
        const usuarioCompleto = await this.trabajadores.getTrabajadorByAppId(
          user.uid,
        );
        const nombreUsuario = usuarioCompleto?.nombreApellidos || user.email;

        // Registro de la auditoría
        await this.loggerService.create({
          action: "Eliminar Ausencia",
          name: nombreUsuario,
          extraData: { ausenciaData: ausenciaToDelete },
        });

        return {
          ok: true,
          data: respAusencias,
        };
      }

      throw Error("No se ha podido borrar la ausencia");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("updateAusencia")
  async updateAusencia(@Body() ausencia: any, @User() user: UserRecord) {
    try {
      // Obtener el nombre del usuario autenticado
      const usuarioCompleto = await this.trabajadores.getTrabajadorByAppId(
        user.uid,
      );
      const nombreUsuario = usuarioCompleto?.nombreApellidos || user.email;

      ausencia.fechaInicio = DateTime.fromFormat(
        ausencia.fechaInicio,
        "dd/MM/yyyy",
      ).toJSDate();
      ausencia.fechaFinal = DateTime.fromFormat(
        ausencia.fechaFinal,
        "dd/MM/yyyy",
      ).toJSDate();
      const respAusencia = await this.ausenciasInstance.updateAusencia(
        ausencia,
      );
      if (respAusencia) {
        // Registrar en el logger
        await this.loggerService.create({
          action: "Actualizar Ausencia",
          name: nombreUsuario,
          extraData: { ausenciaData: ausencia },
        });
        return {
          ok: true,
          data: respAusencia,
        };
      }
      throw Error("No se ha podido modificar la ausencia");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("updateAusenciaResto")
  async updateAusenciaResto(@Body() ausencia: any, @User() user: UserRecord) {
    try {
      // Obtener el nombre del usuario autenticado
      const usuarioCompleto = await this.trabajadores.getTrabajadorByAppId(
        user.uid,
      );
      const nombreUsuario = usuarioCompleto?.nombreApellidos || user.email;

      ausencia.fechaInicio = DateTime.fromFormat(
        ausencia.fechaInicio,
        "dd/MM/yyyy",
      ).toJSDate();
      if (ausencia.fechaFinal)
        ausencia.fechaFinal = DateTime.fromFormat(
          ausencia.fechaFinal,
          "dd/MM/yyyy",
        ).toJSDate();
      if (ausencia.fechaRevision)
        ausencia.fechaRevision = DateTime.fromFormat(
          ausencia.fechaRevision,
          "dd/MM/yyyy",
        ).toJSDate();

      const respAusencia = await this.ausenciasInstance.updateAusenciaResto(
        ausencia,
      );
      if (respAusencia) {
        // Registrar auditoría
        await this.loggerService.create({
          action: "Actualizar Ausencia Resto",
          name: nombreUsuario,
          extraData: { ausenciaData: ausencia },
        });
        return {
          ok: true,
          data: respAusencia,
        };
      }

      throw Error("No se ha podido modificar la ausencia");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
  @UseGuards(AuthGuard)
  @Get("getAusencias")
  async getAusencias() {
    try {
      const respAusencias = await this.ausenciasInstance.getAusencias();
      if (respAusencias) return { ok: true, data: respAusencias };
      else throw Error("No se ha encontrado ninguna ausencia");
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get("getAusenciasTrabajador")
  getAusenciasTrabajador(
    @Query() reqAusenciasTrabajador: GetAusenciasTrabajadorDto,
  ) {
    const inicio = DateTime.fromISO(reqAusenciasTrabajador.fechaInicio);
    const final = DateTime.fromISO(reqAusenciasTrabajador.fechaFinal);

    return this.ausenciasInstance.getAusenciasTrabajador(
      reqAusenciasTrabajador.idTrabajador,
      inicio,
      final,
    );
  }

  // @UseGuards(SchedulerGuard)
  @Get("sincronizarAusenciasOmne")
  async sincronizarAusenciasOmne() {
    await this.ausenciasInstance.sincronizarAusenciasOmne();
    return { message: "Sincronización completada correctamente" };
  }
}
