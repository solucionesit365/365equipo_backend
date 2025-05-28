import { Module, forwardRef } from "@nestjs/common";
import { TiendaService } from "./tienda.service";
import { TiendaDatabaseService } from "./tienda.database";
import { TrabajadorModule } from "../trabajador/trabajador.module";
import { TiendasController } from "./tienda.controller";

@Module({
  imports: [forwardRef(() => TrabajadorModule)],
  providers: [TiendaService, TiendaDatabaseService],
  exports: [TiendaService],
  controllers: [TiendasController],
})
export class TiendaModule {}
