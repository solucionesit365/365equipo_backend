import {
  Controller,
  Post,
  UseGuards,
  Headers,
  Body,
  Get,
  Query,
} from "@nestjs/common";
import { AuthGuard } from "../guards/auth.guard";
import { FirebaseService } from "../firebase/firebase.service";
import { Incidencia } from "./incidencias.class";
import { Incidencias, IncidenciasInvitado } from "./incidencias.interface";
import { Notificaciones } from "../notificaciones/notificaciones.class";
import { TrabajadorService } from "../trabajadores/trabajadores.class";

@Controller("incidencias")
export class IncidenciasController {
  constructor(
    private readonly authInstance: FirebaseService,
    private readonly incidenciaInstance: Incidencia,
    private readonly notificaciones: Notificaciones,
    private readonly trabajadores: TrabajadorService,
  ) {}

  @UseGuards(AuthGuard)
  @Post("nuevaIncidencia")
  async nuevaIncidencia(@Body() incidencia: Incidencias) {
    try {
      return {
        ok: true,
        data: await this.incidenciaInstance.nuevaIncidencia(incidencia),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  //Incidencia invitado
  @Post("nuevaIncidenciaInvitado")
  async nuevaIncidenciaInvitado(@Body() incidencia: IncidenciasInvitado) {
    try {
      return {
        ok: true,
        data: await this.incidenciaInstance.nuevaIncidenciaInvitado(incidencia),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getIncidencias")
  async getIncidencia() {
    try {
      const respIncidencias = await this.incidenciaInstance.getIncidencias();
      if (respIncidencias) {
        // Filtrar las incidencias por destinatario
        const filteredIncidencias = respIncidencias.filter(
          (incidencia) => incidencia.destinatario === "tecnicos",
        );
        return { ok: true, data: filteredIncidencias };
      } else {
        throw Error("No se ha encontrado ninguna incidencia");
      }
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get("getIncidenciasRrhh")
  async getIncidenciasRrhh() {
    try {
      const respIncidencias = await this.incidenciaInstance.getIncidencias();
      if (respIncidencias) {
        // Filtrar las incidencias por destinatario
        const filteredIncidencias = respIncidencias.filter(
          (incidencia) => incidencia.destinatario === "rrhh",
        );
        return { ok: true, data: filteredIncidencias };
      } else {
        throw Error("No se ha encontrado ninguna incidencia");
      }
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get("getIncidenciasEstado")
  async getIncidenciasEstado(@Query() { estado }: { estado: string }) {
    try {
      const respIncidencias =
        await this.incidenciaInstance.getIncidenciasByEstado(estado);
      // Filtrar las incidencias por destinatario
      const filteredIncidencias = respIncidencias.filter(
        (incidencia) => incidencia.destinatario === "tecnicos",
      );
      return { ok: true, data: filteredIncidencias };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getIncidenciasEstadoRrhh")
  async getIncidenciasEstadoRrhh(@Query() { estado }: { estado: string }) {
    try {
      const respIncidencias =
        await this.incidenciaInstance.getIncidenciasEstadoRrhh(estado);
      // Filtrar las incidencias por destinatario
      const filteredIncidencias = respIncidencias.filter(
        (incidencia) => incidencia.destinatario === "rrhh",
      );
      return { ok: true, data: filteredIncidencias };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getIncidenciasByCategoria")
  async getIncidenciasByCategoria(
    @Query() { categoria }: { categoria: string },
  ) {
    try {
      const respIncidencias =
        await this.incidenciaInstance.getIncidenciasByCategoria(categoria);
      // Filtrar las incidencias por destinatario
      const filteredIncidencias = respIncidencias.filter(
        (incidencia) => incidencia.destinatario === "tecnicos",
      );
      return { ok: true, data: filteredIncidencias };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getIncidenciasByCategoriaRrhh")
  async getIncidenciasByCategoriaRrhh(
    @Query() { categoria }: { categoria: string },
  ) {
    try {
      const respIncidencias =
        await this.incidenciaInstance.getIncidenciasByCategoriaRrhh(categoria);
      // Filtrar las incidencias por destinatario
      const filteredIncidencias = respIncidencias.filter(
        (incidencia) => incidencia.destinatario === "rrhh",
      );
      return { ok: true, data: filteredIncidencias };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getIncidenciasByPrioridad")
  async getIncidenciasByPrioridad(
    @Query() { prioridad }: { prioridad: string },
  ) {
    try {
      const respIncidencias =
        await this.incidenciaInstance.getIncidenciasByPrioridad(prioridad);
      // Filtrar las incidencias por destinatario
      const filteredIncidencias = respIncidencias.filter(
        (incidencia) => incidencia.destinatario === "tecnicos",
      );
      return { ok: true, data: filteredIncidencias };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getIncidenciasByPrioridadRrhh")
  async getIncidenciasByPrioridadRrhh(
    @Query() { prioridad }: { prioridad: string },
  ) {
    try {
      const respIncidencias =
        await this.incidenciaInstance.getIncidenciasByPrioridadRrhh(prioridad);

      // Filtrar las incidencias por destinatario
      const filteredIncidencias = respIncidencias.filter(
        (incidencia) => incidencia.destinatario === "rrhh",
      );
      return { ok: true, data: filteredIncidencias };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("updateIncidenciaEstado")
  async updateIncidenciaEstado(@Body() incidencia: Incidencias) {
    try {
      if (await this.incidenciaInstance.updateIncidenciaEstado(incidencia)) {
        const arrayTrabajador = await this.trabajadores.getTrabajadorByAppId(
          incidencia.uid,
        );
        if (arrayTrabajador.idApp != null) {
          this.notificaciones.newInAppNotification({
            uid: arrayTrabajador.idApp,
            titulo: "Estado de la incidencia",
            mensaje: `El estado de tu incidencia a cambiado a ${incidencia.estado}`,
            leido: false,
            creador: "SISTEMA",
            url: "/abrir-incidencia",
          });
        }

        return {
          ok: true,
        };
      }
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("updateIncidenciaMensajes")
  async updateIncidenciaMensajes(@Body() incidencia: Incidencias) {
    try {
      if (await this.incidenciaInstance.updateIncidenciaMensajes(incidencia)) {
        const arrayTrabajador = await this.trabajadores.getTrabajadorByAppId(
          incidencia.uid,
        );
        if (arrayTrabajador.idApp != null) {
          this.notificaciones.newInAppNotification({
            uid: arrayTrabajador.idApp,
            titulo: "Mensaje Incidencia",
            mensaje: "Te han respondido la incidencia",
            leido: false,
            creador: "SISTEMA",
            url: "/abrir-incidencia",
          });
        }

        return {
          ok: true,
        };
      }
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getIncidenciasByUid")
  async getIncidenciasByUid(@Query() { uid }: { uid: string }) {
    try {
      const respIncidencias = await this.incidenciaInstance.getIncidenciasByUid(
        uid,
      );

      return {
        ok: true,
        data: respIncidencias,
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("updateIncidenciaDestinatario")
  async updateIncidenciaDestinatario(@Body() incidencia: Incidencias) {
    try {
      return {
        ok: true,
        data: await this.incidenciaInstance.updateIncidenciaDestinatario(
          incidencia,
        ),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("deleteIncidencia")
  async deleteIncidencias(@Body() { _id }: { _id: string }) {
    try {
      const respAusencias = await this.incidenciaInstance.deleteIncidencias(
        _id,
      );
      if (respAusencias)
        return {
          ok: true,
          data: respAusencias,
        };

      throw Error("No se ha podido borrar la incidencia");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
