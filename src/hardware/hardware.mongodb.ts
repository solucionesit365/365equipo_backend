import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { HardWareInterface } from "./hardWare.interface";
import { ObjectId } from "mongodb";

@Injectable()
export class HardwareDatabase {
  constructor(private readonly mongoDbService: MongoService) {}

  async newHardWare(hardware: HardWareInterface) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const hardwares = db.collection<HardWareInterface>("inventarioHardware");

    const resInsert = await hardwares.insertOne(hardware);

    if (resInsert.acknowledged) return resInsert.insertedId;
    return null;
  }

  async getHardware() {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const hardwares = db.collection<HardWareInterface>("inventarioHardware");

    return await hardwares.find().toArray();
  }

  async updateHardware(hardWare: HardWareInterface) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const hInventario = db.collection<HardWareInterface>("inventarioHardware");
    const response = await hInventario.updateOne(
      {
        _id: new ObjectId(hardWare._id),
      },
      {
        $set: {
          trabajador: hardWare.trabajador,
          estadoPrestamo: hardWare.estadoPrestamo,
          licenciaOffice: hardWare.licenciaOffice,
          fechaEntrega: hardWare.fechaEntrega,
          historial: hardWare.historial,
        },
      },
    );

    return response.acknowledged;
  }

  async updateHardwareAll(hardWare: HardWareInterface) {
    const db = (await this.mongoDbService.getConexion()).db("soluciones");
    const hInventario = db.collection<HardWareInterface>("inventarioHardware");
    const response = await hInventario.updateOne(
      {
        _id: new ObjectId(hardWare._id),
      },
      {
        $set: {
          departamento: hardWare.departamento,
          tipo: hardWare.tipo,
          marca: hardWare.marca,
          modelo: hardWare.modelo,
          SO: hardWare.SO,
          capacidad: hardWare.capacidad,
          memoria: hardWare.memoria,
          procesador: hardWare.procesador,
          tipoDisk: hardWare.tipoDisk,
          SN: hardWare.SN,
          IMEI: hardWare.IMEI,
          IMEI2: hardWare.IMEI2,
          wmicBios: hardWare.wmicBios,
        },
      },
    );

    return response.acknowledged;
  }
}
