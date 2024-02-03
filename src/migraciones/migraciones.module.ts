import { Module } from "@nestjs/common";
import { MigracionesService } from "./migraciones.service";
import { TiendasModule } from "../tiendas/tiendas.module";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";

@Module({
  imports: [TiendasModule, TrabajadoresModule],
  providers: [MigracionesService],
  exports: [MigracionesService],
})
export class MigracionesModule {}
