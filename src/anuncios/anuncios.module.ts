import { Module, forwardRef } from "@nestjs/common";
import { AnunciosService } from "./anuncios.class";
import { AnunciosDatabaseService } from "./anuncios.mongodb";
import { AnunciosController } from "./anuncios.controller";
import { NotificacionesModule } from "../notificaciones/notificaciones.module";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";

@Module({
  imports: [NotificacionesModule, forwardRef(() => TrabajadoresModule)],
  providers: [AnunciosService, AnunciosDatabaseService],
  exports: [AnunciosService],
  controllers: [AnunciosController],
})
export class AnunciosModule {}
