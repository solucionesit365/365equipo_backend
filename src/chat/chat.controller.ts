import { Controller, Get, Post, Body, Param } from "@nestjs/common";

import { ChatService } from "./chat.class";
import { Chat } from "./chat.interface";

@Controller("chat")
export class ChatController {
  constructor(private readonly chatInstance: ChatService) {}

  @Get("history/:contactId")
  async getChatHistory(
    @Param("contactId") contactId: number,
    @Param("senderId") senderId: number,
  ): Promise<Chat[]> {
    return await this.chatInstance.getMessagesByContact(contactId, senderId);
  }

  @Post("send")
  async sendMessage(@Body() mensaje: Chat): Promise<Chat[]> {
    return await this.chatInstance.saveMessage(mensaje);
  }

  @Post("markAsRead")
  async markMessagesAsRead(
    @Body() body: { ids: string[]; contactId: number; readerId: number },
  ) {
    // Llama al servicio para marcar los mensajes como leídos
    return await this.chatInstance.markMessageAsRead(body);
  }
}
