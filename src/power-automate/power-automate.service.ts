import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";

@Injectable()
export class PowerAutomateService {
  constructor(private readonly mongoService: MongoService) {}

  getTag(tag: string, body: string) {
    const startTag = `[${tag}]`;
    const endTag = `[/${tag}]`;

    const startIndex = body.indexOf(startTag);
    if (startIndex === -1) return null;

    const endIndex = body.indexOf(endTag, startIndex);
    if (endIndex === -1) return null;

    const content = body.substring(startIndex + startTag.length, endIndex);

    return content;
  }

  async saveInPowerAutomateCollection(data: any) {
    const db = (await this.mongoService.getConexion()).db("soluciones");
    const powerAutomateCache = db.collection("power-automate-cache");
    await powerAutomateCache.insertOne(data);
  }
}
