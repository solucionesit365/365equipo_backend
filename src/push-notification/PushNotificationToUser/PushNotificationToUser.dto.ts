import { IsNotEmpty, IsString } from "class-validator";

export class PushNotificationToUserDto {
  @IsNotEmpty()
  @IsString()
  uid: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}
