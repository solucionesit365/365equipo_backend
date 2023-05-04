import { Injectable } from "@nestjs/common";
import { app } from "./app"; // Asegúrate de ajustar la ruta de importación según la ubicación de tu archivo app.ts
import { getMessaging, Message } from "firebase-admin/messaging";

@Injectable()
export class FirebaseMessagingService {
  private messaging: ReturnType<typeof getMessaging>;

  constructor() {
    this.messaging = getMessaging(app);
  }

  async sendNotification(token: string): Promise<void> {
    // Define las opciones de la notificación
    const notification = {
      title: "Título de la notificación",
      body: "Cuerpo de la notificación",
      icon: "URL del icono (opcional)",
    };

    // Define el mensaje
    const message: Message = {
      notification,
      token,
    };

    try {
      // Envia el mensaje
      const response = await this.messaging.send(message);
      console.log("Notificación enviada con éxito:", response);
    } catch (error) {
      console.error("Error al enviar la notificación:", error);
    }
  }
}
