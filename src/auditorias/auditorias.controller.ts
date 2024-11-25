import { Controller, Post, UseGuards, Body, Get, Query } from "@nestjs/common";
import { AuthGuard } from "../guards/auth.guard";

import {
  AuditoriasInterface,
  AuditoriaRespuestas,
} from "./auditorias.interface";
import { AuditoriasService } from "./auditorias.class";
import { Tienda } from "src/tiendas/tiendas.class";

@Controller("auditorias")
export class AuditoriasController {
  constructor(
    private readonly auditoriaInstance: AuditoriasService,
    private readonly tiendasInstance: Tienda,
  ) {}

  @UseGuards(AuthGuard)
  @Post("nuevaAuditoria")
  async nuevaIncidencia(@Body() auditoria: AuditoriasInterface) {
    try {
      if (typeof auditoria.caducidad === "string") {
        auditoria.caducidad = new Date(auditoria.caducidad);
      }
      return {
        ok: true,
        data: await this.auditoriaInstance.nuevaAuditoria(auditoria),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getAuditorias")
  async getAuditorias() {
    try {
      const respAuditoria = await this.auditoriaInstance.getAuditorias();
      if (respAuditoria) return { ok: true, data: respAuditoria };
      else throw Error("No se ha encontrado ninguna auditoria");
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get("getAuditoriasHabilitado")
  async getAuditoriasHabilitado(
    @Query() { habilitado }: { habilitado: string },
  ) {
    try {
      const habilitadoBollean = habilitado == "true" ? true : false;

      const respAuditoria =
        await this.auditoriaInstance.getAuditoriasHabilitado(habilitadoBollean);
      if (respAuditoria) return { ok: true, data: respAuditoria };
      else throw Error("No se ha encontrado ninguna auditoria");
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AuthGuard)
  @Post("updateHabilitarAuditoria")
  async updateHabilitarAuditoria(@Body() auditoria: AuditoriasInterface) {
    try {
      const respAuditoria =
        await this.auditoriaInstance.updateHabilitarAuditoria(auditoria);
      if (respAuditoria)
        return {
          ok: true,
          data: respAuditoria,
        };
      console.log(respAuditoria);

      throw Error("No se ha podido habilitar la auditoria");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("updateDeshabilitarAuditoria")
  async updateDeshabilitarAuditoria(@Body() auditoria: AuditoriasInterface) {
    try {
      const respAuditoria =
        await this.auditoriaInstance.updateDeshabilitarAuditoria(auditoria);
      if (respAuditoria)
        return {
          ok: true,
          data: respAuditoria,
        };

      throw Error("No se ha podido deshabilitar la auditoria");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
  //Respuestas auditorias
  @UseGuards(AuthGuard)
  @Post("respuestasAuditorias")
  async respuestasAuditorias(@Body() auditoria: AuditoriaRespuestas) {
    try {
      return {
        ok: true,
        data: await this.auditoriaInstance.respuestasAuditorias(auditoria),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  //Ver Respuestas AuditoriasService
  @UseGuards(AuthGuard)
  @Get("getRespuestaAuditorias")
  async getRespuestaAuditoria(
    @Query() { idAuditoria }: { idAuditoria: string },
  ) {
    try {
      let respMongo = [];
      if (idAuditoria) {
        respMongo = await this.auditoriaInstance.getRespuestasAuditorias(
          idAuditoria,
        );
      }
      if (respMongo.length > 0) {
        return {
          ok: true,
          data: respMongo,
        };
      } else return { ok: false, data: [] };
    } catch (error) {
      console.log(error);
      return { ok: false, message: error.message };
    }
  }

  //Mostrar todas las tiendas
  @UseGuards(AuthGuard)
  @Get("tiendasAuditoria")
  async tiendasAuditoria() {
    try {
      const resptiendas = await this.tiendasInstance.getTiendas();
      if (resptiendas) return { ok: true, data: resptiendas };
      else throw Error("No se ha encontrado ninguna tienda");
    } catch (error) {
      console.log(error);
    }
  }

  //Mostrar auditorias por idTienda

  @UseGuards(AuthGuard)
  @Get("getAuditoriasTienda")
  async getAuditoriasTienda(
    @Query() { tienda, habilitado }: { tienda: number; habilitado: string },
  ) {
    try {
      const habilitadoBollean = habilitado === "true";

      const respAuditoria = await this.auditoriaInstance.getAuditoriasTienda(
        Number(tienda),
        habilitadoBollean,
      );
      if (respAuditoria) return { ok: true, data: respAuditoria };
      else throw Error("No se ha encontrado ninguna auditoria");
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get("getAuditoriasTiendas")
  async getAuditoriasTiendas(@Query() { tienda }: { tienda: number }) {
    try {
      const respAuditoria = await this.auditoriaInstance.getAuditoriasTiendas(
        Number(tienda),
      );
      if (respAuditoria) return { ok: true, data: respAuditoria };
      else throw Error("No se ha encontrado ninguna auditoria");
    } catch (error) {
      console.log(error);
    }
  }
  //Borrar auditoria
  @UseGuards(AuthGuard)
  @Post("deleteAuditoria")
  async deleteAuditoria(@Body() auditoria: AuditoriasInterface) {
    try {
      const respAuditoria = await this.auditoriaInstance.deleteAuditoria(
        auditoria,
      );
      if (respAuditoria)
        return {
          ok: true,
          data: respAuditoria,
        };

      throw Error("No se ha podido borrar la auditoria");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  //Update Auditoria
  @UseGuards(AuthGuard)
  @Post("updateAuditoria")
  async updateAuditoria(@Body() auditoria: AuditoriasInterface) {
    try {
      if (typeof auditoria.caducidad === "string") {
        auditoria.caducidad = new Date(auditoria.caducidad);
      }

      if (await this.auditoriaInstance.updateAuditoria(auditoria))
        return {
          ok: true,
        };
      throw Error("No se ha podido modificar la auditoria");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  //Update Auditoria
  @UseGuards(AuthGuard)
  @Post("updateAuditoriaRespuestas")
  async updateAuditoriaRespuestas(@Body() auditoria: AuditoriaRespuestas) {
    try {
      if (await this.auditoriaInstance.updateAuditoriaRespuestas(auditoria))
        return {
          ok: true,
        };
      throw Error("No se ha podido modificar la auditoria");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
