import { Body, Controller, Post } from "@nestjs/common";
import { IRegisterNotificationDeviceUseCase } from "./IRegisterNotificationDevice.use-case";
import { RegisterNotificationDeviceDto } from "./RegisterNotificationDevice.dto";

@Controller("register-notification-device")
export class RegisterNotificationDeviceController {
  constructor(
    private readonly registerNotificationDeviceUseCase: IRegisterNotificationDeviceUseCase,
  ) {}

  @Post()
  async registerDevice(
    @Body() reqRegisterDevice: RegisterNotificationDeviceDto,
  ) {
    await this.registerNotificationDeviceUseCase.execute(
      reqRegisterDevice.uid,
      reqRegisterDevice.token,
    );
  }
}
