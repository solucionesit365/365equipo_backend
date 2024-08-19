import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { Biometria } from "./biometria.interface";

@Injectable()
export class BiometriaDatabase {
  constructor(private readonly mongoDbService: MongoService) {}

  // Guardar el challenge en la colección de autenticación
  async saveChallenge(userId: string, challenge: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const authCollection = db.collection<Biometria>("biometria");

    await authCollection.updateOne(
      { userId },
      { $set: { userId, challenge } },
      { upsert: true },
    );
  }

  // Obtener el challenge de la colección de autenticación
  async getChallenge(userId: string) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const authCollection = db.collection<Biometria>("biometria");

    return await authCollection.findOne({ userId });
  }

  // Guardar la credencial en la colección de autenticación
  async saveCredential(userId: string, credential: any) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const authCollection = db.collection<Biometria>("biometria");

    await authCollection.updateOne({ userId }, { $set: { credential } });
  }
}
