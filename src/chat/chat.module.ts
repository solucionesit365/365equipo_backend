import { Module, forwardRef } from "@nestjs/common";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.class";
import { ChatDatabase } from "./chat.mongodb";
import { ChatGateway } from "./chat.gateway";
import { TrabajadorModule } from "src/trabajador/trabajador.module";
import { NotificacionesModule } from "src/notificaciones/notificaciones.module";

@Module({
  imports: [
    forwardRef(() => TrabajadorModule),
    forwardRef(() => NotificacionesModule),
  ],
  providers: [ChatService, ChatDatabase, ChatGateway],
  controllers: [ChatController],
})
export class ChatModule {}
