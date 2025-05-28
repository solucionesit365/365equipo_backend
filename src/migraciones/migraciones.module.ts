import { Module } from "@nestjs/common";
// import { MigracionesService } from "./migraciones.service";
import { TiendasModule } from "../tienda/tienda.module";
import { TrabajadoresModule } from "../trabajador/trabajador.module";
// import { MigracionesController } from "./migraciones.controller";

@Module({
  imports: [TiendasModule, TrabajadoresModule],
  // providers: [MigracionesService],
  // exports: [MigracionesService],
  // controllers: [MigracionesController],
})
export class MigracionesModule {}
