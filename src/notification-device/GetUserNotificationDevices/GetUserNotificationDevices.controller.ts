import { Controller, Get, Query } from "@nestjs/common";
import { IGetUserNotificationDevicesUseCase } from "./IGetUserNotificationDevices.use-case";
import { GetUserNotificationDevicesDto } from "./GetUserNotificationDevices.dto";

@Controller("get-user-notification-devices")
export class GetUserNotificationDevicesController {
  constructor(
    private readonly getUserNotificationDevicesUseCase: IGetUserNotificationDevicesUseCase,
  ) {}

  @Get()
  handle(@Query() req: GetUserNotificationDevicesDto) {
    return this.getUserNotificationDevicesUseCase.execute(req.uid);
  }
}
