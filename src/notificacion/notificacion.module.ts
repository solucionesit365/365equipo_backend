import { Module } from "@nestjs/common";
import { NotificacionRepositoryService } from "./notificacion.repository.service";

@Module({
  providers: [NotificacionRepositoryService],
})
export class NotificacionModule {}
