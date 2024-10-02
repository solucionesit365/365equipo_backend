import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";

import { ChatService } from "./chat.class";
import { Chat } from "./chat.interface";
import { AuthGuard } from "../guards/auth.guard";
import { Notificaciones } from "../notificaciones/notificaciones.class";
import { TrabajadorService } from "src/trabajadores/trabajadores.class";

@Controller("chat")
export class ChatController {
  constructor(
    private readonly chatInstance: ChatService,
    private readonly notificacionesInstance: Notificaciones,
    private readonly trabajadoresInstance: TrabajadorService,
  ) {}

  @UseGuards(AuthGuard)
  @Get("history/:contactId")
  async getChatHistory(
    @Param("contactId") contactId: number,
    @Param("senderId") senderId: number,
  ): Promise<Chat[]> {
    return await this.chatInstance.getMessagesByContact(contactId, senderId);
  }

  @UseGuards(AuthGuard)
  @Post("send")
  async sendMessage(@Body() mensaje: Chat): Promise<Chat[]> {
    // Guarda el mensaje en la base de datos
    const savedMessage = await this.chatInstance.saveMessage(mensaje);

    const recipientId = mensaje.contactId;

    const trabajadorID = await this.trabajadoresInstance.getTrabajadorBySqlId(
      recipientId,
    );
    // Obtiene el ID del destinatario del mensaje

    if (trabajadorID.idApp) {
      const token = await this.notificacionesInstance.getFCMToken(
        trabajadorID.idApp,
      );

      // Si hay un token disponible, envía la notificación
      if (token && token.token) {
        await this.notificacionesInstance.sendNotificationToDevice(
          token.token,
          "Nuevo mensaje",
          `${mensaje.sender} te ha enviado un mensaje.`,
          "/chatview",
        );
      }

      return savedMessage;
    }
  }

  @UseGuards(AuthGuard)
  @Post("markAsRead")
  async markMessagesAsRead(@Body() body: { ids: string[] }) {
    console.log("Datos recibidos para marcar como leídos:", body);

    // Llama al servicio para marcar los mensajes como leídos
    return await this.chatInstance.markMessageAsRead(body);
  }
}
