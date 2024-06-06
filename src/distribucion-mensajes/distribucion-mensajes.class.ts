import { DistribucionMensajesDatabase } from "./distribucion-mensajes.mongodb";
import { DistribucionMensajes } from "./distribucion-mensajes.interface";

export class DistribucionMensajesClass {
  constructor(private readonly dMensajesDatabase: DistribucionMensajesDatabase) {}

  async insertarMensaje(mensaje: DistribucionMensajes) {
    return await this.dMensajesDatabase.insertarMensaje(mensaje);
  }
}
