import { MongoClient, MongoClientOptions } from "mongodb";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MongoService {
  private conexion: Promise<MongoClient>;

  constructor(private configService: ConfigService) {
    const mongoHost = "mongo-cluster-d1c18377.mongo.ondigitalocean.com";
    let uri: string;
    const options: MongoClientOptions = {
      maxPoolSize: 1500, // Establece el tamaño máximo del pool de conexiones
    };

    if (process.env.ENTORNO === "test") {
      uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${mongoHost}/365equipo_test`;
    } else {
      uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${mongoHost}/365equipo`;
    }

    const client = new MongoClient(uri, options);
    this.conexion = client.connect();
  }

  getConexion() {
    return this.conexion;
  }
}
