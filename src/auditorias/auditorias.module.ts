import { Module } from "@nestjs/common";
import { AuditoriasService } from "./auditorias.class";
import { AuditoriaDatabase } from "./auditorias.mongodb";
import { AuditoriasController } from "./auditorias.controller";
import { TiendasModule } from "../tiendas/tiendas.module";

@Module({
  imports: [TiendasModule],
  providers: [AuditoriasService, AuditoriaDatabase],
  exports: [AuditoriasService],
  controllers: [AuditoriasController],
})
export class AuditoriasModule {}
