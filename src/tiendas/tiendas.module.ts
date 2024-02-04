import { Module, forwardRef } from "@nestjs/common";
import { Tienda } from "./tiendas.class";
import { TiendaDatabaseService } from "./tiendas.database";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";
import { TiendasController } from "./tiendas.controller";

@Module({
  imports: [forwardRef(() => TrabajadoresModule)],
  providers: [Tienda, TiendaDatabaseService],
  exports: [Tienda],
  controllers: [TiendasController],
})
export class TiendasModule {}
