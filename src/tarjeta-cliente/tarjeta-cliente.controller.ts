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

  // @Post("test2")
  // async test2() {
  //   try {
  //     return {
  //       ok: true,
  //       data: this.tarjetaClienteInstance.test(),
  //     };
  //   } catch (err) {
  //     console.log(err);
  //     return { ok: false, message: err.message };
  //   }
  // }

  // @Post("generar")
  // async generar() {
  //   try {
  //     return {
  //       ok: true,
  //       data: this.tarjetaClienteInstance.generarClaves(),
  //     };
  //   } catch (err) {
  //     console.log(err);
  //     return { ok: false, message: err.message };
  //   }
  // }
}
