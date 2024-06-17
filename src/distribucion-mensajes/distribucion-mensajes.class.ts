import { Injectable } from "@nestjs/common";
import { DistribucionMensajesDatabase } from "./distribucion-mensajes.mongodb";
import { DistribucionMensajes } from "./distribucion-mensajes.interface";

@Injectable()
export class DistribucionMensajesClass {
  constructor(
    private readonly dMensajesDatabase: DistribucionMensajesDatabase,
  ) {}

  async insertarMensaje(mensaje: DistribucionMensajes) {
    const response = await this.dMensajesDatabase.insertarMensajeDB(mensaje);

    if (response) {
      return true;
    }
  }

  async getAllMensajes() {
    return await this.dMensajesDatabase.getAllMensajeDB();
  }

  async getOneMessage() {
    return await this.dMensajesDatabase.getOneMessage();
  }

  async updateOneMensajes(id: string, activo: boolean) {
    return await this.dMensajesDatabase.updateOneMensajes(id, activo);
  }

  async updateMensajeforDate(inicio: Date, final: Date) {
    return await this.dMensajesDatabase.updateMensajeforDate(inicio, final);
  }
}
