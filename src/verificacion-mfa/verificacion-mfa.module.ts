import { Module } from "@nestjs/common";
import { VerificacionService } from "./verificacionmfa.class";
import { VerifiacacionDatabase } from "./verificacionmfa.mongodb";

@Module({
  providers: [VerificacionService, VerifiacacionDatabase],
  exports: [VerificacionService],
})
export class VerificacionMfaModule {}
