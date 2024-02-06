import { Controller, Get, Query, UseGuards, Post, Body } from "@nestjs/common";
import { SchedulerGuard } from "../guards/scheduler.guard";
import { TrabajadorService } from "./trabajadores.class";
import { AdminGuard } from "../guards/admin.guard";
import { AuthGuard } from "../guards/auth.guard";
import { User } from "../decorators/get-user.decorator";
import { DecodedIdToken } from "firebase-admin/auth";

@Controller("trabajadores")
export class TrabajadoresController {
  constructor(private readonly trabajadorInstance: TrabajadorService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getTrabajadores() {
    try {
      const arrayTrabajadores = await this.trabajadorInstance.getTrabajadores();

      return {
        ok: true,
        data: arrayTrabajadores.map((trabajador) => {
          return {
            ...trabajador,
            inicioContrato:
              trabajador.contratos[0].inicioContrato.toLocaleDateString(),
          };
        }),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getTrabajadorByAppId")
  async getTrabajadorByAppId(@Query() { uid }) {
    try {
      const resUser = await this.trabajadorInstance.getTrabajadorByAppId(uid);
      // console.log(resUser);
      return { ok: true, data: resUser };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getTrabajadorBySqlId")
  async getTrabajadorBySqlId(@Query() { id }) {
    try {
      const resUser = await this.trabajadorInstance.getTrabajadorBySqlId(id);

      return { ok: true, data: resUser };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getTrabajadoresByTienda")
  async getTrabajadoresByTienda(@Query() { idTienda }) {
    try {
      const resUser = await this.trabajadorInstance.getTrabajadoresByTienda(
        Number(idTienda),
      );

      return { ok: true, data: resUser };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("validarQR")
  async validarQRTrabajador(@Query() { idTrabajador, tokenQR }) {
    try {
      if (!idTrabajador && !tokenQR) throw Error("Faltan datos");
      const resUser = await this.trabajadorInstance.getTrabajadorTokenQR(
        Number(idTrabajador),
        tokenQR,
      );

      return { ok: true, data: resUser };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getSubordinados")
  async getSubordinados(@Query() { uid }) {
    try {
      if (!uid) throw Error("Faltan datos");

      const resUser = await this.trabajadorInstance.getSubordinados(uid);

      return { ok: true, data: resUser };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("actualizarTrabajadores")
  async actualizarTrabajadores() {
    try {
      return {
        ok: true,
        data: await this.trabajadorInstance.sincronizarConHit(),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(SchedulerGuard)
  @Get("sincronizarConHit")
  async sincronizarConHit() {
    try {
      return {
        ok: true,
        data: await this.trabajadorInstance.sincronizarConHit(),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Post("registro")
  async registroUsuarios(@Body() { dni, password }) {
    try {
      if (!dni || !password || password < 6)
        throw Error("Algunos parámetros no son correctos");

      return {
        ok: true,
        data: await this.trabajadorInstance.registrarUsuario(dni, password),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("guardarCambios")
  async guardarCambiosForm(
    @Body()
    { modificado, original },
    @User() firebaseUser: DecodedIdToken,
  ) {
    try {
      return {
        ok: true,
        data: await this.trabajadorInstance.guardarCambiosForm(
          original,
          firebaseUser,
          modificado,
        ),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("arbolById")
  async getArbolById(@Query() { idSql }: { idSql: string }) {
    try {
      if (!idSql) throw Error("Faltan parámetros");

      return {
        ok: true,
        data: await this.trabajadorInstance.getArbolById(Number(idSql)),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AdminGuard)
  @Post("borrarTrabajador")
  async borrarTrabajador(@Body() { idSql }) {
    try {
      if (!idSql) throw Error("Faltan parámetros");

      return {
        ok: true,
        data: await this.borrarTrabajador(idSql),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getAllCoordis")
  async getAllCoordis() {
    try {
      return {
        ok: true,
        data: await this.trabajadorInstance.getCoordis(),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getSubordinadosByIdsql")
  async getSubordinadosByIdsql(@Query() { idSql }) {
    try {
      if (!idSql) throw Error("Faltan datos");

      const resUser = await this.trabajadorInstance.getSubordinadosByIdsql(
        idSql,
      );

      return { ok: true, data: resUser };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("uploadFoto")
  async uploadFoto(@Body() { displayFoto, uid }) {
    try {
      return {
        ok: true,
        data: await this.trabajadorInstance.uploadFoto(displayFoto, uid),
      };
    } catch (error) {
      console.log(error);
      return { ok: false, message: error.message };
    }
  }
}
