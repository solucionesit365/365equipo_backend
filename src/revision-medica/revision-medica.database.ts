import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { RevisionMedicaDto } from "./revision-medica.dto";

@Injectable()
export class RevisionMedicaDatabase {
  constructor(private readonly mongoDb: MongoService) {}

  async guardarSolicitud(data: RevisionMedicaDto) {
    const db = (await this.mongoDb.getConexion()).db();
    const collection = db.collection<RevisionMedicaDto>("revisionMedica");
    return await collection.insertOne(data);
  }

  async getSolicitudes() {
    const db = (await this.mongoDb.getConexion()).db();
    return await db
      .collection<RevisionMedicaDto>("revisionMedica")
      .find()
      .toArray();
  }
}
