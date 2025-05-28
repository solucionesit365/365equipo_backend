import { forwardRef, Module } from "@nestjs/common";
import { AuditoriasService } from "./auditorias.class";
import { AuditoriaDatabase } from "./auditorias.mongodb";
import { AuditoriasController } from "./auditorias.controller";
import { TiendaModule } from "../tienda/tienda.module";
import { TrabajadorModule } from "src/trabajador/trabajador.module";

@Module({
  imports: [TiendaModule, forwardRef(() => TrabajadorModule)],
  providers: [AuditoriasService, AuditoriaDatabase],
  exports: [AuditoriasService],
  controllers: [AuditoriasController],
})
export class AuditoriasModule {}
