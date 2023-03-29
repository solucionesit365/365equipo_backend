// import { MongoClient } from "mongodb";

// const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@soluciones-365equipo.vbpm2wm.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
// const client = new MongoClient(uri);
// const conexion = client.connect();
// export { conexion };

import { MongoClient } from "mongodb";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MongoDbService {
  private conexion: Promise<MongoClient>;

  constructor(private configService: ConfigService) {
    const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@soluciones-365equipo.vbpm2wm.mongodb.net/?retryWrites=true&w=majority`;
    console.log(uri);
    const client = new MongoClient(uri);
    this.conexion = client.connect();
  }

  getConexion() {
    return this.conexion;
  }
}
