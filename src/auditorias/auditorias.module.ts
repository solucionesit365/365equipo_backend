import { forwardRef, Module } from "@nestjs/common";
import { AuditoriasService } from "./auditorias.class";
import { AuditoriaDatabase } from "./auditorias.mongodb";
import { AuditoriasController } from "./auditorias.controller";
import { TiendasModule } from "../tiendas/tiendas.module";
import { TrabajadoresModule } from "src/trabajadores/trabajadores.module";

@Module({
  imports: [TiendasModule, forwardRef(() => TrabajadoresModule)],
  providers: [AuditoriasService, AuditoriaDatabase],
  exports: [AuditoriasService],
  controllers: [AuditoriasController],
})
export class AuditoriasModule {}
