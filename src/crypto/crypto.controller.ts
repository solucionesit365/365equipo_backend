import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { CryptoClass } from "./crypto.class";

@Controller("crypto")
export class CryptoController {
  constructor(private readonly cryptoInstance: CryptoClass) {}

  // Endpoint de ejemplo, no se debe usar en producción
  @Post("cifrar")
//   @UseGuards(AuthGuard)
  async cifrar(@Body() { message }: { message: string }) {
    try {
      return {
        ok: true,
        data: this.cryptoInstance.cifrarParaHit(message),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  // Endpoint de ejemplo, no se debe usar en producción
  @Post("descifrar")
//   @UseGuards(AuthGuard)
  async descifrar(@Body() { encryptedMessage }: { encryptedMessage: string }) {
    try {
      return {
        ok: true,
        data: this.cryptoInstance.descifrar(encryptedMessage),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
