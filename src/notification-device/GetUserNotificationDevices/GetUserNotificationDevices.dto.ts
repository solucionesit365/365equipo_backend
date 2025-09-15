import { IsNotEmpty, IsString } from "class-validator";

export class GetUserNotificationDevicesDto {
  @IsNotEmpty()
  @IsString()
  uid: string;
}
