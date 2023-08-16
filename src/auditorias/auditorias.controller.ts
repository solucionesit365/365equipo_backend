import {
  Controller,
  Post,
  UseGuards,
  Headers,
  Body,
  Get,
  Query,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { TokenService } from "../get-token/get-token.service";
import { AuthService } from "../firebase/auth";
import {
  AuditoriasInterface,
  AuditoriaRespuestas,
} from "./auditorias.interface";
import { Auditorias } from "./auditorias.class";
import { Tienda } from "src/tiendas/tiendas.class";

@Controller("auditorias")
export class AuditoriasController {
  constructor(
    private readonly authInstance: AuthService,
    private readonly tokenService: TokenService,
    private readonly auditoriaInstance: Auditorias,
    private readonly tiendasInstance: Tienda,
  ) {}

  @Post("nuevaAuditoria")
  @UseGuards(AuthGuard)
  async nuevaIncidencia(
    @Headers("authorization") authHeader: string,
    @Body() auditoria: AuditoriasInterface,
  ) {
    try {
      return {
        ok: true,
        data: await this.auditoriaInstance.nuevaAuditoria(auditoria),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("getAuditorias")
  @UseGuards(AuthGuard)
  async getAuditorias(@Headers("authorization") authHeader: string) {
    try {
      const respAuditoria = await this.auditoriaInstance.getAuditorias();
      if (respAuditoria) return { ok: true, data: respAuditoria };
      else throw Error("No se ha encontrado ninguna auditoria");
    } catch (error) {
      console.log(error);
    }
  }

  @Get("getAuditoriasHabilitado")
  @UseGuards(AuthGuard)
  async getAuditoriasHabilitado(
    @Headers("authorization") authHeader: string,
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

  @Post("updateHabilitarAuditoria")
  async updateHabilitarAuditoria(
    @Body() auditoria: AuditoriasInterface,
    @Headers("authorization") authHeader: string,
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);
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

  @Post("updateDeshabilitarAuditoria")
  async updateDeshabilitarAuditoria(
    @Body() auditoria: AuditoriasInterface,
    @Headers("authorization") authHeader: string,
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);
      const respAuditoria =
        await this.auditoriaInstance.updateDeshabilitarAuditoria(auditoria);
      if (respAuditoria)
        return {
          ok: true,
          data: respAuditoria,
        };
      console.log(respAuditoria);

      throw Error("No se ha podido deshabilitar la auditoria");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
  //Respuestas auditorias
  @Post("respuestasAuditorias")
  @UseGuards(AuthGuard)
  async respuestasAuditorias(
    @Headers("authorization") authHeader: string,
    @Body() auditoria: AuditoriaRespuestas,
  ) {
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

  //Ver Respuestas Auditorias
  @Get("getRespuestaAuditorias")
  @UseGuards(AuthGuard)
  async getRespuestaAuditoria(
    @Headers("authorization") authHeader: string,
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
  @Get("tiendasAuditoria")
  @UseGuards(AuthGuard)
  async tiendasAuditoria(@Headers("authorization") authHeader: string) {
    try {
      const resptiendas = await this.tiendasInstance.getTiendas();
      if (resptiendas) return { ok: true, data: resptiendas };
      else throw Error("No se ha encontrado ninguna tienda");
    } catch (error) {
      console.log(error);
    }
  }

  //Mostrar auditorias por idTienda
  @Get("getAuditoriasTienda")
  @UseGuards(AuthGuard)
  async getAuditoriasTienda(
    @Headers("authorization") authHeader: string,
    @Query() { tienda, habilitado }: { tienda: number; habilitado: boolean },
  ) {
    try {
      const habilitadoBollean = (habilitado = "true" ? true : false);

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

  @Get("getAuditoriasTiendas")
  @UseGuards(AuthGuard)
  async getAuditoriasTiendas(
    @Headers("authorization") authHeader: string,
    @Query() { tienda }: { tienda: number },
  ) {
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
  @Post("deleteAuditoria")
  async deleteAuditoria(
    @Body() auditoria: AuditoriasInterface,
    @Headers("authorization") authHeader: string,
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);
      const respAuditoria = await this.auditoriaInstance.deleteAuditoria(
        auditoria,
      );
      if (respAuditoria)
        return {
          ok: true,
          data: respAuditoria,
        };
      console.log(respAuditoria);

      throw Error("No se ha podido borrar la auditoria");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  //Update Auditoria
  @Post("updateAuditoria")
  async updateAuditoria(
    @Body() auditoria: AuditoriasInterface,
    @Headers("authorization") authHeader: string,
  ) {
    try {
      console.log(auditoria);

      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

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
  @Post("updateAuditoriaRespuestas")
  async updateAuditoriaRespuestas(
    @Body() auditoria: AuditoriaRespuestas,
    @Headers("authorization") authHeader: string,
  ) {
    try {
      console.log(auditoria);

      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

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
