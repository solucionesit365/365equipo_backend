import { Module } from "@nestjs/common";
import { NotificacionHorasExtrasMongoService } from "./notificacion-horas-extras.mongodb";
import { NotificacionHorasExtrasController } from "./notificacion-horas-extras.controller";
import { NotificacionHorasExtrasClass } from "./notificacion-horas-extras.class";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";
import { NotificacionesModule } from "../notificaciones/notificaciones.module";
@Module({
  imports: [TrabajadoresModule, NotificacionesModule],
  providers: [
    NotificacionHorasExtrasMongoService,
    NotificacionHorasExtrasClass,
  ],
  exports: [NotificacionHorasExtrasClass],
  controllers: [NotificacionHorasExtrasController],
})
export class NotificacionHorasExtrasModule {}
