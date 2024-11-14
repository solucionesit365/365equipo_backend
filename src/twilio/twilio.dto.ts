import { IsNotEmpty, IsString } from "class-validator";

export class SendOTPDto {
  @IsNotEmpty()
  @IsString()
  phone: string;
}

export class VerifyOTPDto {
  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  code: string;
}
