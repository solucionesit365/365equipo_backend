import { Module, forwardRef } from "@nestjs/common";
import { Tienda } from "./tienda.service";
import { TiendaDatabaseService } from "./tienda.database";
import { TrabajadorModule } from "../trabajador/trabajador.module";
import { TiendasController } from "./tienda.controller";

@Module({
  imports: [forwardRef(() => TrabajadorModule)],
  providers: [Tienda, TiendaDatabaseService],
  exports: [Tienda],
  controllers: [TiendasController],
})
export class TiendaModule {}
