import { Module } from "@nestjs/common";
import { CryptoService } from "./crypto.class";
import { CryptoController } from "./crypto.controller";

@Module({
  providers: [CryptoService],
  exports: [CryptoService],
  controllers: [CryptoController],
})
export class CryptoModule {}
