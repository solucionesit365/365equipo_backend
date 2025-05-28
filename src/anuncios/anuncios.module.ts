import { Module, forwardRef } from "@nestjs/common";
import { AnunciosService } from "./anuncios.class";
import { AnunciosDatabaseService } from "./anuncios.mongodb";
import { AnunciosController } from "./anuncios.controller";
import { NotificacionesModule } from "../notificaciones/notificaciones.module";
import { TrabajadorModule } from "../trabajador/trabajador.module";

@Module({
  imports: [NotificacionesModule, forwardRef(() => TrabajadorModule)],
  providers: [AnunciosService, AnunciosDatabaseService],
  exports: [AnunciosService],
  controllers: [AnunciosController],
})
export class AnunciosModule {}
