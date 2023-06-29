import { MongoClient } from "mongodb";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MongoDbService {
  private conexion: Promise<MongoClient>;

  constructor(private configService: ConfigService) {
    const uri = `mongodb+srv://${process.env.MONGO_USER}:${
      process.env.MONGO_PASS
    }@${
      process.env.NODE_ENV === "development"
        ? "cluster0.w1mji2j.mongodb.net"
        : "soluciones-365equipo.vbpm2wm.mongodb.net/?retryWrites=true&w=majority"
    }`;
    const client = new MongoClient(uri);
    this.conexion = client.connect();
  }

  getConexion() {
    return this.conexion;
  }
}
