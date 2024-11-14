import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { TwilioService } from "./twilio.service";
import { AuthGuard } from "../guards/auth.guard";
import { SendOTPDto, VerifyOTPDto } from "./twilio.dto";

@Controller("twilio")
export class TwilioController {
  constructor(private readonly twilioService: TwilioService) {}

  @UseGuards(AuthGuard)
  @Post("sms")
  async sendSms() {
    return await this.twilioService.sendSms("+34678456123", "Hola, soy un SMS");
  }

  @UseGuards(AuthGuard)
  @Post("send-otp")
  async sendOtp(@Body() req: SendOTPDto) {
    return await this.twilioService.sendOtp(req.phone);
  }

  @UseGuards(AuthGuard)
  @Post("verify-otp")
  async verifyOtp(@Body() req: VerifyOTPDto) {
    return await this.twilioService.verifyOtp(req.phone, req.code);
  }
}
