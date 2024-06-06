import { Controller, Post, UseGuards, Body } from "@nestjs/common";
import { DistribucionMensajesClass } from "./distribucion-mensajes.class";
import { AuthGuard } from "../guards/auth.guard";
import { DistribucionMensajes } from "./distribucion-mensajes.interface";

@Controller("distribucion-mensajes")
export class DistribucionMensajesController {
  constructor(
    private readonly DistribucionMensajesClass: DistribucionMensajesClass,
  ) {}
  @UseGuards(AuthGuard)
  @Post("nuevoVideo")
  async insertarMensaje(@Body() mensaje: DistribucionMensajes) {
    try {
      console.log(mensaje);
    } catch (error) {}
  }
}
