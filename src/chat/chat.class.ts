import { Injectable } from "@nestjs/common";
import { ObjectId } from "mongodb";
import { DateTime } from "luxon";
import { ChatDatabase } from "./chat.mongodb";
import { Chat } from "./chat.interface";

@Injectable()
export class ChatService {
  constructor(private readonly schchat: ChatDatabase) {}

  async getMessagesByContact(contactId: number, senderId: number) {
    return await this.schchat.getMessagesByContact(contactId, senderId);
  }

  async saveMessage(mensaje: Chat) {
    // Asegúrate de que `createdAt` sea una instancia de `Date` válida
    mensaje.createdAt = new Date();
    return await this.schchat.saveMessage(mensaje);
  }

  async markMessageAsRead(mensajes: {
    ids: string[];
    contactId: number;
    readerId: number;
  }) {
    return await this.schchat.markMessageAsRead(mensajes);
  }
}
