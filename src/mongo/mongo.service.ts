import { MongoClient, MongoClientOptions } from "mongodb";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MongoService {
  private conexion: Promise<MongoClient>;
  //Nueva direccion de base de datos
  constructor(private configService: ConfigService) {
    let mongoHost: string = null;

    const options: MongoClientOptions = {
      maxPoolSize: 1500, // Establece el tamaño máximo del pool de conexiones
    };

    if (process.env.ENTORNO === "test") {
      mongoHost = "test-365equipo.cgnccs9.mongodb.net";
    } else mongoHost = "365-equipo-new.kfiby.mongodb.net";
    const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${mongoHost}/soluciones`;
    const client = new MongoClient(uri, options);
    this.conexion = client.connect();
  }

  getConexion() {
    return this.conexion;
  }
}
