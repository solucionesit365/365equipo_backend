import { Controller, Post, Body } from "@nestjs/common";
import { FirebaseMessagingService } from "../firebase/firebase-messaging.service";

@Controller("notificaciones")
export class NotificacionesController {
  constructor(private readonly messagingService: FirebaseMessagingService) {}

  @Post("send")
  async sendNotification(@Body("token") token: string): Promise<void> {
    await this.messagingService.sendNotification(token);
  }
}
