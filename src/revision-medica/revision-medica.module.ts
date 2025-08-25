import { Module } from "@nestjs/common";
import { RevisionMedicaController } from "./revision-medica.controller";
import { TrabajadoresModule } from "src/trabajadores/trabajadores.module";
import { ParametrosModule } from "src/parametros/parametros.module";
import { EmailModule } from "src/email/email.module";

@Module({
  imports: [TrabajadoresModule, ParametrosModule, EmailModule],
  providers: [],
  controllers: [RevisionMedicaController],
  exports: [],
})
export class RevisionMedicaModule {}
