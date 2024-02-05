import { Module } from "@nestjs/common";
// import { MigracionesService } from "./migraciones.service";
import { TiendasModule } from "../tiendas/tiendas.module";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";
// import { MigracionesController } from "./migraciones.controller";

@Module({
  imports: [TiendasModule, TrabajadoresModule],
  // providers: [MigracionesService],
  // exports: [MigracionesService],
  // controllers: [MigracionesController],
})
export class MigracionesModule {}
