import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Delete,
  Param,
  Put,
} from "@nestjs/common";
import { InspeccionFurgosClass } from "./inspeccion-furgos.class";
import { AuthGuard } from "../guards/auth.guard";
import { FurgonetaDto, InspeccionFurgos } from "./inspeccion-furgos.dto";
import { DateTime } from "luxon";
import { EmailService } from "../email/email.class";

@Controller("inspecciones-furgos")
export class InspeccionFurgosController {
  constructor(
    private readonly inspeccionesInstance: InspeccionFurgosClass,
    private readonly emailService: EmailService,
  ) {}

  @UseGuards(AuthGuard)
  @Post("nueva")
  async nuevaInspeccion(@Body() inspeccion: InspeccionFurgos) {
    try {
      const data = await this.inspeccionesInstance.nuevaInspeccion({
        checklist: inspeccion.checklist,
        estadoUso: inspeccion.estadoUso,
        km: inspeccion.km,
        fecha: DateTime.fromISO(inspeccion.fecha as string),
        matricula: inspeccion.matricula,
        nombreConductor: inspeccion.nombreConductor,
        observaciones: inspeccion.observaciones || null,
      });

      const hayDanos = inspeccion.checklist?.some(
        (item) => item.status === "DAÑOS",
      );

      if (hayDanos) {
        await this.emailService.enviarEmail(
          "jaafaralanti@grupohorreols.com",
          `<p>Se ha registrado una nueva inspección con <b>DAÑOS</b> para la furgoneta <b>${inspeccion.matricula}</b> por ${inspeccion.nombreConductor}.</p>`,
          "Nueva inspección con daños registrada",
        );
      }

      return { ok: true, data };
    } catch (err) {
      console.error(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("todas")
  async getAllInspecciones() {
    try {
      return {
        ok: true,
        data: await this.inspeccionesInstance.getAllInspecciones(),
      };
    } catch (err) {
      console.error(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("matricula/:matricula")
  async getInspeccionesByMatricula(@Param("matricula") matricula: string) {
    try {
      const inspecciones =
        await this.inspeccionesInstance.getInspeccionesByMatricula(matricula);
      return {
        ok: true,
        count: inspecciones ? inspecciones.length : 0,
        data: inspecciones,
      };
    } catch (err) {
      console.error(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Delete("borrar-inspeccion/:id")
  async borrarInspeccionById(@Param("id") id: string) {
    try {
      const result = await this.inspeccionesInstance.borrarInspeccion(id);
      return {
        ok: true,
        message: "Inspección borrada correctamente",
      };
    } catch (err) {
      console.error("Error borrando inspección:", err);
      return { ok: false, message: err.message };
    }
  }

  // @UseGuards(AuthGuard)
  // @Get("transportistas")
  // async getTransportistas() {
  //   try {
  //     const transportistas =
  //       await this.inspeccionesInstance.getTransportistas();
  //     return {
  //       ok: true,
  //       count: transportistas ? transportistas.length : 0,
  //       data: transportistas,
  //     };
  //   } catch (err) {
  //     console.error(err);
  //     return { ok: false, message: err.message };
  //   }
  // }

  @UseGuards(AuthGuard)
  @Post("crear-furgoneta")
  async crearFurgoneta(@Body() furgoneta: FurgonetaDto) {
    console.log("Crear furgoneta");
    console.log(furgoneta);

    try {
      const resultado =
        await this.inspeccionesInstance.crearFurgoneta(furgoneta);
      return { ok: true, data: resultado };
    } catch (err) {
      console.error(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("allFurgonetas")
  async getAllFurgonetas() {
    try {
      return {
        ok: true,
        data: await this.inspeccionesInstance.getAllFurgonetas(),
      };
    } catch (err) {
      console.error(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Put("actualizar-furgoneta/:id")
  async actualizarFurgoneta(
    @Param("id") id: string,
    @Body() furgoneta: FurgonetaDto,
  ) {
    try {
      const resultado = await this.inspeccionesInstance.actualizarFurgoneta(
        id,
        furgoneta,
      );
      return {
        ok: true,
        message: "Furgoneta actualizada correctamente",
        data: resultado,
      };
    } catch (err) {
      console.error("Error actualizando furgoneta:", err);
      return { ok: false, message: err.message };
    }
  }
}