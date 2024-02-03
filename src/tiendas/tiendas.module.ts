import { Module } from "@nestjs/common";
import { Tienda } from "./tiendas.class";
import { TiendaDatabaseService } from "./tiendas.database";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";

@Module({
  imports: [TrabajadoresModule],
  providers: [Tienda, TiendaDatabaseService],
  exports: [Tienda],
})
export class TiendasModule {}
