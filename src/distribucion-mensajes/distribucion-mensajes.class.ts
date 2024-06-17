import { Injectable } from "@nestjs/common";
import { DistribucionMensajesDatabase } from "./distribucion-mensajes.mongodb";
import { DistribucionMensajes } from "./distribucion-mensajes.interface";

@Injectable()
export class DistribucionMensajesClass {
  constructor(
    private readonly dMensajesDatabase: DistribucionMensajesDatabase,
  ) {}

  // async insertarMensaje(mensajes: DistribucionMensajes) {
  //   console.log(mensajes);

  //   const response = await this.dMensajesDatabase.insertarMensajeDB(mensajes);

  //   if (response) {
  //     return true;
  //   } else false;
  // }

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

  async deleteMessage(id: string) {
    return await this.dMensajesDatabase.deleteMessage(id);
  }
}
