import { MongoClient } from "mongodb";

export abstract class IMongoService {
  abstract getConexion(): Promise<MongoClient>;
}
