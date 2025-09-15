import { IsNotEmpty, IsString } from "class-validator";

export class RegisterNotificationDeviceDto {
  @IsNotEmpty()
  @IsString()
  uid: string;

  @IsNotEmpty()
  @IsString()
  token: string;
}
