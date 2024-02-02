import { Controller, Post, UseGuards } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import { MantenimientoDto } from "./mantenimiento.interface";
import { SchedulerGuard } from "../guards/scheduler.guard";

@Controller("mantenimiento")
export class MantenimientoController {
  constructor(private readonly mongoDbService: MongoService) {}

  @Post("getEstado")
  async getEstado() {
    try {
      const db = (await this.mongoDbService.getConexion()).db("soluciones");
      const mantenimientoCollection =
        db.collection<MantenimientoDto>("mantenimiento");
      const resEstado = await mantenimientoCollection.findOne({
        _id: "ESTADO_MANTENIMIENTO",
      });

      if (!resEstado) return false;
      else return !!resEstado.estado;
    } catch (err) {
      console.log(err);
      return 0;
    }
  }

  @Post("activarMantenimiento")
  @UseGuards(SchedulerGuard)
  async activarMantenimiento() {
    try {
      const db = (await this.mongoDbService.getConexion()).db("soluciones");
      const mantenimientoCollection =
        db.collection<MantenimientoDto>("mantenimiento");
      const resEstado = await mantenimientoCollection.updateOne(
        {
          _id: "ESTADO_MANTENIMIENTO",
        },
        { $set: { estado: true } },
        { upsert: true },
      );

      if (resEstado.acknowledged) return true;
      return false;
    } catch (err) {
      console.log(err);
      return 0;
    }
  }
  @Post("desactivarMantenimiento")
  @UseGuards(SchedulerGuard)
  async desactivarMantenimiento() {
    try {
      const db = (await this.mongoDbService.getConexion()).db("soluciones");
      const mantenimientoCollection =
        db.collection<MantenimientoDto>("mantenimiento");
      const resEstado = await mantenimientoCollection.updateOne(
        {
          _id: "ESTADO_MANTENIMIENTO",
        },
        { $set: { estado: false } },
        { upsert: true },
      );

      if (resEstado.acknowledged) return true;
      return false;
    } catch (err) {
      console.log(err);
      return 0;
    }
  }
}
