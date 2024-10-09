import { Controller, Post, UseGuards } from "@nestjs/common";
import { TwilioService } from "./twilio.service";
import { AuthGuard } from "../guards/auth.guard";

@Controller("twilio")
export class TwilioController {
  constructor(private readonly twilioService: TwilioService) {}

  @UseGuards(AuthGuard)
  @Post("sms")
  async sendSms() {
    return await this.twilioService.sendSms();
  }
}
