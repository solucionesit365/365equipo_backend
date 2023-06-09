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
    // const notification = {
    //   title: "Título de la notificación",
    //   body: "Cuerpo de la notificación",
    //   icon: "https://silema.web.app/favicon.png",
    // };

    // // Define el mensaje
    // const message: Message = {
    //   notification,
    //   token,
    // };

    const message = {
      token: token, // El token del dispositivo al que deseas enviar la notificación
      notification: {
        title: "Título de la notificación",
        body: "Cuerpo de la notificación",
      },
      webpush: {
        notification: {
          icon: "https://silema.web.app/favicon.png", // La URL del ícono que deseas mostrar en la notificación
        },
      },
    };

    try {
      // Envia el mensaje
      const response = await this.messaging.send(message);
      // console.log("Notificación enviada con éxito:", response);
    } catch (error) {
      console.error("Error al enviar la notificación:", error);
    }
  }

  async subscribeToTopic(token: string) {
    try {
      await this.messaging.subscribeToTopic(token, "all_users");
      // console.log(`Token ${token} subscribed to topic all_users`);
      return true;
    } catch (err) {
      console.error("Error subscribing to topic:", err);
      throw Error(err.message);
    }
  }
}
