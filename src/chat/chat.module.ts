import { Module } from "@nestjs/common";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.class";
import { ChatDatabase } from "./chat.mongodb";

@Module({
  providers: [ChatService, ChatDatabase],
  controllers: [ChatController],
})
export class ChatModule {}
