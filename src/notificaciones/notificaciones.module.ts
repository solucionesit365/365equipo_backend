import { Module } from "@nestjs/common";
import { Notificaciones } from "./notificaciones.class";
import { NotificacionsDatabase } from "./notificaciones.mongodb";

@Module({
  providers: [Notificaciones, NotificacionsDatabase],
  exports: [Notificaciones],
})
export class NotificacionesModule {}
