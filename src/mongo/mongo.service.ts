import { MongoClient, MongoClientOptions } from "mongodb";
import { Injectable } from "@nestjs/common";
import { IMongoService } from "./mongo.interface";

@Injectable()
export class MongoService extends IMongoService {
  private conexion: Promise<MongoClient>;

  constructor() {
    super();
    const mongoHost = "mongo-cluster-d1c18377.mongo.ondigitalocean.com";
    let uri: string;
    const options: MongoClientOptions = {
      maxPoolSize: 1500, // Establece el tamaño máximo del pool de conexiones
    };

    if (process.env.ENTORNO === "test") {
      uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${mongoHost}/365equipo_test?tls=true&authSource=admin&replicaSet=mongo-cluster`;
    } else {
      uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${mongoHost}/365equipo?tls=true&authSource=admin&replicaSet=mongo-cluster`;
    }

    const client = new MongoClient(uri, options);
    this.conexion = client.connect();
  }

  getConexion() {
    return this.conexion;
  }
}
