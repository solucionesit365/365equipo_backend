import { Collection, MongoClient, MongoClientOptions } from "mongodb";
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";

@Injectable()
export class MongoService implements OnModuleInit, OnModuleDestroy {
  private readonly client: MongoClient;
  private conexion: MongoClient | null = null;

  constructor() {
    const mongoHost = "mongo-cluster-d1c18377.mongo.ondigitalocean.com";
    let uri: string;
    const options: MongoClientOptions = {
      maxPoolSize: 1500,
    };

    if (process.env.ENTORNO === "test") {
      uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${mongoHost}/365equipo_test?tls=true&authSource=admin&replicaSet=mongo-cluster`;
    } else {
      uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${mongoHost}/365equipo?tls=true&authSource=admin&replicaSet=mongo-cluster`;
    }

    this.client = new MongoClient(uri, options);
  }

  // NestJS llama a esto automáticamente después del constructor
  async onModuleInit() {
    this.conexion = await this.client.connect();
    console.log("MongoDB conectado correctamente");
  }

  async onModuleDestroy() {
    if (this.conexion) {
      await this.conexion.close();
      console.log("MongoDB desconectado");
    }
  }

  getConexion(): MongoClient {
    if (!this.conexion) {
      throw new Error("MongoDB no está conectado todavía");
    }
    return this.conexion;
  }

  async getCollection<T = Document>(
    collectionName: string,
  ): Promise<Collection<T>> {
    const client = this.getConexion();
    const db = client.db();
    return db.collection<T>(collectionName);
  }
}
