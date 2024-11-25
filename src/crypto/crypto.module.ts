import { Module } from "@nestjs/common";
import { CryptoService } from "./crypto.class";

@Module({
  providers: [CryptoService],
  exports: [CryptoService],
})
export class CryptoModule {}
