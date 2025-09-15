import { Module, forwardRef } from "@nestjs/common";
import { Tienda } from "./tiendas.class";
import { TiendaDatabaseService } from "./tiendas.database";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";
import { TiendasController } from "./tiendas.controller";
import { TiendaRepository } from "./repository/Tienda.repository";
import { ITiendaRepository } from "./repository/ITienda.repository";
import { IGetTiendasUseCase } from "./GetTiendas/IGetTiendas.use-case";
import { GetTiendasUseCase } from "./GetTiendas/GetTiendas.use-case";
import { GetTiendasController } from "./GetTiendas/GetTiendas.controller";

@Module({
  imports: [forwardRef(() => TrabajadoresModule)],
  providers: [
    Tienda,
    TiendaDatabaseService,
    {
      useClass: TiendaRepository,
      provide: ITiendaRepository,
    },
    {
      useClass: GetTiendasUseCase,
      provide: IGetTiendasUseCase,
    },
  ],
  exports: [Tienda],
  controllers: [TiendasController, GetTiendasController],
})
export class TiendasModule {}
