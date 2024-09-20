import { Module, forwardRef } from "@nestjs/common";
import { NotasInformativasController } from "./notas-informativas.controller";
import { NotasInformativasDatabes } from "./notas-informativas.mongodb";
import { NotasInformativasClass } from "./notas-informativas.class";
import { NotificacionesModule } from "../notificaciones/notificaciones.module";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";

@Module({
  imports: [NotificacionesModule, forwardRef(() => TrabajadoresModule)],
  providers: [NotasInformativasClass, NotasInformativasDatabes],
  exports: [NotasInformativasClass],
  controllers: [NotasInformativasController],
})
export class NotasInformativasModule {}
