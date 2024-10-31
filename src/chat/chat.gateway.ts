import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.class";

@WebSocketGateway({
  cors: {
    origin: [
      "http://localhost:8080",
      "https://silema.web.app",
      "https://365equipo.com",
      "https://club365obrador.web.app",
      "https://silema--test-08eqf71j.web.app",
      "https://tarjeta-cliente.web.app",
      "https://demo.365equipo.com",
      "https://silema--test-271uc5ji.web.app",
    ],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatInstance: ChatService) {}
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;

    if (userId && userId !== "undefined") {
      client.join(userId);
    } else {
      console.error(
        `El cliente ${client.id} no tiene un userId válido: ${userId}`,
      );
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage("message")
  handleMessage(
    client: Socket,
    payload: { content: string; senderId: number; contactId: number },
  ) {
    const { contactId, senderId } = payload;

    if (contactId && senderId) {
      // Emitir a la sala del contacto y a la sala del remitente (ambos reciben el mensaje)
      this.server.to(contactId.toString()).emit("message", payload);
      this.server.to(senderId.toString()).emit("message", payload);
    } else {
      console.error(
        `El mensaje no tiene un contactId o senderId válido: ${payload}`,
      );
    }
  }

  // Nuevo método para manejar el evento `messagesRead`
  @SubscribeMessage("messagesRead")
  async handleMessagesRead(
    client: Socket,
    payload: { messageIds: string[]; contactId: number; readerId: number },
  ) {
    const { messageIds, contactId, readerId } = payload;

    // Llamar a la lógica de actualización de base de datos
    await this.chatInstance.markMessageAsRead({
      ids: messageIds,
    });

    // Emitir el evento `messagesRead` a ambos: el `contactId` (receptor) y el `senderId` (remitente)
    this.server.to(contactId.toString()).emit("messagesRead", payload);
    this.server.to(readerId.toString()).emit("messagesRead", payload);
  }
}
