import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { FaqInterface } from "./faq.interface";

@Injectable()
export class FaqService {
  constructor(private readonly mongoService: MongoService) {}

  async newPregunta(pregunta: FaqInterface) {
    const db = (await this.mongoService.getConexion()).db();
    const preguntas = db.collection<FaqInterface>("faq");

    const resInsert = await preguntas.insertOne(pregunta);

    if (resInsert.acknowledged) return resInsert.insertedId;
    return null;
  }

  async getPreguntas() {
    const db = (await this.mongoService.getConexion()).db();
    const preguntas = db.collection<FaqInterface>("faq");

    const resPreguntas = await preguntas.find().toArray();

    return resPreguntas;
  }
}
