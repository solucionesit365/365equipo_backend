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
import { TiendaAteneaRepository } from "./repository/TiendaAtenea.repository";
import { ITiendaMongoRepository } from "./repository/ITiendaAtenea.repository";
import { IGetTiendasAteneaUseCase } from "./GetTiendasAtenea/IGetTiendasAtenea.use-case";
import { GetTiendasAteneaUseCase } from "./GetTiendasAtenea/GetTiendasAtenea.use-case";
import { GetTiendasAteneaController } from "./GetTiendasAtenea/GetTiendasAtenea.controller";
import { CreateTiendaMongoUseCase } from "./CreateTiendaMongo/CreateTiendaMongo.use-case";
import { ICreateTiendaMongoUseCase } from "./CreateTiendaMongo/ICreateTiendaMongo.use-case";
import { UpdateTiendaMongoUseCase } from "./UpdateTiendaMongo/UpdateTiendaMongo.use-case";
import { IUpdateTiendaMongoUseCase } from "./UpdateTiendaMongo/IUpdateTiendaMongo.use-case";

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
    {
      useClass: TiendaAteneaRepository,
      provide: ITiendaMongoRepository,
    },
    {
      useClass: GetTiendasAteneaUseCase,
      provide: IGetTiendasAteneaUseCase,
    },
    {
      useClass: CreateTiendaMongoUseCase,
      provide: ICreateTiendaMongoUseCase,
    },
    {
      useClass: UpdateTiendaMongoUseCase,
      provide: IUpdateTiendaMongoUseCase,
    },
  ],
  exports: [Tienda],
  controllers: [
    TiendasController,
    GetTiendasController,
    GetTiendasAteneaController,
  ],
})
export class TiendasModule {}
