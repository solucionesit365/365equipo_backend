import { Injectable, InternalServerErrorException } from "@nestjs/common";
import {
  ICreateTiendaMongo,
  ITiendaMongoRepository,
} from "./ITiendaAtenea.repository";
import { Tiendas2 } from "../tiendas.dto";
import { MongoService } from "../../mongo/mongo.service";
import { DeleteResult, InsertOneResult, ObjectId } from "mongodb";
import { IUpdateTiendaMongo } from "../UpdateTiendaMongo/IUpdateTiendaMongo.use-case";

@Injectable()
export class TiendaAteneaRepository implements ITiendaMongoRepository {
  constructor(private readonly mongoService: MongoService) {}

  async getTiendasAtenea(): Promise<Tiendas2[]> {
    try {
      const db = (await this.mongoService.getConexion()).db();
      const tiendasCollection = db.collection<Tiendas2>("tiendas");
      const tiendas = await tiendasCollection.find({}).toArray();
      return tiendas;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async createTienda(
    payload: ICreateTiendaMongo,
  ): Promise<InsertOneResult<ICreateTiendaMongo>> {
    try {
      const db = (await this.mongoService.getConexion()).db();
      const tiendasCollection = db.collection<ICreateTiendaMongo>("tiendas");
      return await tiendasCollection.insertOne(payload);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async update(id: ObjectId, payload: IUpdateTiendaMongo): Promise<void> {
    try {
      const db = (await this.mongoService.getConexion()).db();
      const tiendasCollection = db.collection<ICreateTiendaMongo>("tiendas");
      await tiendasCollection.updateOne({ _id: id }, {
        $set: payload,
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async delete(id: ObjectId): Promise<DeleteResult> {
    try {
      const db = (await this.mongoService.getConexion()).db();
      const tiendasCollection = db.collection<ICreateTiendaMongo>("tiendas");
      return await tiendasCollection.deleteOne({ _id: id });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
