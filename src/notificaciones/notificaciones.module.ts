import { Module } from "@nestjs/common";
import { Notificaciones } from "./notificaciones.class";
import { NotificacionsDatabase } from "./notificaciones.mongodb";
import { NotificacionesController } from "./notificaciones.controller";

@Module({
  providers: [Notificaciones, NotificacionsDatabase],
  exports: [Notificaciones],
  controllers: [NotificacionesController],
})
export class NotificacionesModule {}
