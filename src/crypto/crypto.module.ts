import { Module } from "@nestjs/common";
import { CryptoService } from "./crypto.class";
import { ICryptoService } from "./crypto.interface";

@Module({
  providers: [{ provide: ICryptoService, useClass: CryptoService }],
  exports: [ICryptoService],
})
export class CryptoModule {}
