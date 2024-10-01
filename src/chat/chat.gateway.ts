import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

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
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    console.log(`Cliente conectado con userId: ${userId}`);

    if (userId && userId !== "undefined") {
      client.join(userId);
      console.log(`Cliente ${client.id} unido a la sala ${userId}`);
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
    console.log(`Mensaje recibido de ${client.id}:`, payload);

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
}
