import { Module } from "@nestjs/common";
import { NotificacionHorasExtrasMongoService } from "./notificacion-horas-extras.mongodb";
import { NotificacionHorasExtrasController } from "./notificacion-horas-extras.controller";
import { NotificacionHorasExtrasClass } from "./notificacion-horas-extras.class";
@Module({
  providers: [
    NotificacionHorasExtrasMongoService,
    NotificacionHorasExtrasClass,
  ],
  exports: [NotificacionHorasExtrasClass],
  controllers: [NotificacionHorasExtrasController],
})
export class NotificacionHorasExtrasModule {}
