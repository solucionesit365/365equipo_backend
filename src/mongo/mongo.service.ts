import { MongoClient } from "mongodb";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MongoService {
  private conexion: Promise<MongoClient>;
  //Nueva direccion de base de datos
  constructor(private configService: ConfigService) {
    let mongoHost: string = null;
    if (process.env.ENTORNO === "test") {
      mongoHost = "test-365equipo.cgnccs9.mongodb.net";
    } else mongoHost = "365-equipo-new.kfiby.mongodb.net";
    const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${mongoHost}`;
    const client = new MongoClient(uri);
    this.conexion = client.connect();
  }

  getConexion() {
    return this.conexion;
  }
}
