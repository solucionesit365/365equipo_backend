import { Body, Controller, Post, UseGuards, Get } from "@nestjs/common";
import { AusenciasService } from "./ausencias.class";
import { AuthGuard } from "../guards/auth.guard";
import { DateTime } from "luxon";
import { LoggerService } from "../logger/logger.service";
import { UserRecord } from "firebase-admin/auth";
import { User } from "../decorators/get-user.decorator";
import { TrabajadorService } from "src/trabajadores/trabajadores.class";
import { ObjectId } from "mongodb";

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
    @Body()
    {
      idUsuario,
      fechaInicio,
      fechaFinal,
      fechaRevision,
      tipo,
      horasContrato,
      tienda,
      comentario,
      nombre,
      dni,
      completa,
      horas,
    },
  ) {
    try {
      if (
        tipo === "BAJA" ||
        tipo === "PERMISO MATERNIDAD/PATERNIDAD" ||
        tipo === "DIA_PERSONAL" ||
        tipo === "VACACIONES" ||
        tipo === "HORAS_JUSTIFICADAS" ||
        tipo === "SANCIÓN" ||
        tipo === "ABSENTISMO" ||
        tipo === "REM" ||
        (tipo === "DIA_PERSONAL" &&
          typeof idUsuario === "number" &&
          typeof fechaInicio === "string" &&
          typeof fechaFinal === "string" &&
          typeof fechaRevision === "string" &&
          typeof comentario === "string" &&
          typeof completa === "boolean" &&
          typeof horas === "number")
      ) {
        const inicio = new Date(fechaInicio);
        const final = fechaFinal ? new Date(fechaFinal) : null;
        const revision = fechaRevision ? new Date(fechaRevision) : null;

        return {
          ok: true,
          data: await this.ausenciasInstance.nuevaAusencia(
            idUsuario,
            nombre,
            dni,
            tipo,
            horasContrato,
            tienda,
            inicio,
            final,
            revision,
            comentario,
            completa,
            horas,
          ),
        };
      } else throw Error("Parámetros incorrectos");
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
  async updateAusencia(@Body() ausencia: any) {
    try {
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
      if (respAusencia)
        return {
          ok: true,
          data: respAusencia,
        };

      throw Error("No se ha podido modificar la ausencia");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("updateAusenciaResto")
  async updateAusenciaResto(@Body() ausencia: any) {
    try {
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
      if (respAusencia)
        return {
          ok: true,
          data: respAusencia,
        };

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
}
