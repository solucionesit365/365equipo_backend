import { MongoClient } from "mongodb";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MongoDbService {
  private conexion: Promise<MongoClient>;
//Nueva direccion de base de datos
  constructor(private configService: ConfigService) {
    const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@365-equipo-new.kfiby.mongodb.net/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri);
    this.conexion = client.connect();
  }

  getConexion() {
    return this.conexion;
  }
}
