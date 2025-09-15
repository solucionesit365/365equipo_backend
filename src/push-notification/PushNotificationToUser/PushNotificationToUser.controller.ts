import { Body, Controller, Post } from "@nestjs/common";
import { IPushNotificationToUserUseCase } from "./IPushNotificationToUser.use-case";
import { PushNotificationToUserDto } from "./PushNotificationToUser.dto";

@Controller("push-notification-to-user")
export class PushNotificationToUserController {
  constructor(
    private readonly pushNotificationToUserUseCase: IPushNotificationToUserUseCase,
  ) {}

  @Post()
  async pushNotificationToUser(
    @Body() reqPushNotification: PushNotificationToUserDto,
  ) {
    await this.pushNotificationToUserUseCase.execute(reqPushNotification.uid, {
      body: reqPushNotification.message,
      title: reqPushNotification.title,
      link: reqPushNotification.link,
      iconUrl: reqPushNotification.iconUrl,
    });
  }
}
