import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { Tienda } from "./tiendas.class";
import { AuthGuard } from "../guards/auth.guard";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { FirebaseService } from "../firebase/firebase.service";
import { GetTiendaByIdDto } from "./tiendas.dto";
import { Tiendas2 } from "./tiendas.dto";

@Controller("tiendas")
export class TiendasController {
  constructor(
    private readonly authInstance: FirebaseService,
    private readonly tiendasInstance: Tienda,
    private readonly trabajadorInstance: TrabajadorService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async getTiendas() {
    return await this.tiendasInstance.getTiendas();
  }

  // @UseGuards(AuthGuard)
  // @Get("actualizarTiendas")
  // async actualizarTiendas() {
  //   try {
  //     return {
  //       ok: true,
  //       data: await this.tiendasInstance.actualizarTiendas(),
  //     };
  //   } catch (err) {
  //     console.log(err);
  //     return { ok: false, message: err.message };
  //   }
  // }

  @UseGuards(AuthGuard)
  @Get("responsable")
  async getTiendasResponsable(@Query() { idApp }) {
    try {
      const usuario = await this.trabajadorInstance.getTrabajadorByAppId(idApp);
      return {
        ok: true,
        data: await this.tiendasInstance.getTiendasResponsable(usuario),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("tiendas2")
  async getTiendas2() {
    return await this.tiendasInstance.getTiendas2();
  }

  @UseGuards(AuthGuard)
  @Get("getTiendaById")
  getTiendaById(@Query() reqGetTienda: GetTiendaByIdDto) {
    return this.tiendasInstance.getTiendaByIdExterno(reqGetTienda.id);
  }

  @UseGuards(AuthGuard)
  @Post("addTiendas2")
  async addTiendas2(@Body() tiendas: Tiendas2) {
    try {
      console.log("Recibido en controlador:", tiendas);
      const ok = await this.tiendasInstance.addTiendas2(tiendas);
      return {
        ok,
        message: ok
          ? "Tiendas insertadas correctamente"
          : "No se insertaron tiendas",
      };
    } catch (err) {
      console.error("Error al insertar tiendas:", err);
      return { ok: false, message: err.message };
    }
  }
}
