import { Module } from "@nestjs/common";
import { VerificacionService } from "./verificacionmfa.class";
import { VerifiacacionDatabase } from "./verificacionmfa.mongodb";
import { VerificacionmfaController } from "./verificacionmfa.controller";
import { EmailModule } from "../email/email.module";

@Module({
  imports: [EmailModule],
  providers: [VerificacionService, VerifiacacionDatabase],
  exports: [VerificacionService],
  controllers: [VerificacionmfaController],
})
export class VerificacionMfaModule {}
