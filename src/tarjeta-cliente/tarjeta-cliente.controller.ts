import { Controller, Post } from "@nestjs/common";
import { TarjetaCliente } from "./tarjeta-cliente.class";

@Controller("tarjeta-cliente")
export class TarjetaClienteController {
  constructor(private readonly tarjetaClienteInstance: TarjetaCliente) {}
  @Post()
  async test() {
    try {
      return {
        ok: true,
        data: await this.tarjetaClienteInstance.sendQrCodeEmail(),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
