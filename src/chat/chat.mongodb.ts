import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
// import { ObjectId } from "mongodb";
import { DateTime } from "luxon";
import { Chat } from "./chat.interface";
import { ObjectId } from "mongodb";

@Injectable()
export class ChatDatabase {
  constructor(private readonly mongoDbService: MongoService) {}

  async getMessagesByContact(
    contactId: number,
    senderId: number,
  ): Promise<Chat[]> {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const chatCollection = db.collection<Chat>("chat");
    return await chatCollection
      .find({
        $or: [{ contactId }, { senderId: contactId }],
      })
      .toArray();
  }

  async saveMessage(mensajes: Chat): Promise<Chat[]> {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const chatCollection = db.collection<Chat>("chat");
    mensajes.createdAt = DateTime.now().toJSDate();
    const result = await chatCollection.insertOne(mensajes);
    return await chatCollection.find({ _id: result.insertedId }).toArray();
  }

  async markMessageAsRead(mensajes: { ids: string[] }) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const chatCollection = db.collection<Chat>("chat");

    // Convierte los ids de string a ObjectId
    const messageObjectIds = mensajes.ids.map((id) => new ObjectId(id));

    // Actualiza todos los mensajes que coincidan con los `_id`s proporcionados
    const result = await chatCollection.updateMany(
      {
        _id: { $in: messageObjectIds },
        read: false,
      },
      {
        $set: { read: true },
      },
    );

    // Devuelve los mensajes actualizados
    return await chatCollection
      .find({ _id: { $in: messageObjectIds } })
      .toArray();
  }
}
