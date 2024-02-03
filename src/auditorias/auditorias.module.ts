import { Module } from "@nestjs/common";
import { AuditoriasService } from "./auditorias.class";
import { AuditoriaDatabase } from "./auditorias.mongodb";

@Module({
  providers: [AuditoriasService, AuditoriaDatabase],
  exports: [AuditoriasService],
})
export class AuditoriasModule {}
