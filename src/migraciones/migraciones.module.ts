import { Module } from "@nestjs/common";
// import { MigracionesService } from "./migraciones.service";
import { TiendaModule } from "../tienda/tienda.module";
import { TrabajadorModule } from "../trabajador/trabajador.module";
// import { MigracionesController } from "./migraciones.controller";

@Module({
  imports: [TiendaModule, TrabajadorModule],
  // providers: [MigracionesService],
  // exports: [MigracionesService],
  // controllers: [MigracionesController],
})
export class MigracionesModule {}
