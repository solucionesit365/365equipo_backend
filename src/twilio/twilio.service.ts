import { Injectable, InternalServerErrorException } from "@nestjs/common";
import axios from "axios";
import { randomBytes } from "crypto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class TwilioService {
  constructor(private readonly prismaService: PrismaService) {}

  async sendSms(phone: string, message: string) {
    const accountSid = process.env.TWILIO_SID;
    const authToken = process.env.TWILIO_SECRET;

    const data = new URLSearchParams({
      From: "+3197010208079",
      To: "+34" + phone,
      Body: message,
    });

    const config = {
      method: "post",
      url: `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      auth: {
        username: accountSid,
        password: authToken,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data.toString(),
    };

    try {
      const response = await axios(config);
      console.log("Mensaje enviado correctamente:", response.data);
      return true;
    } catch (error) {
      console.error(
        "Error al enviar SMS:",
        error.response ? error.response.data : error.message,
      );
      return false;
    }
  }

  // With Crypto library
  private generateOtp() {
    return randomBytes(4).toString("hex");
  }

  private async saveOtp(phone: string, otp: string) {
    try {
      await this.prismaService.smsOtp.create({
        data: {
          phone,
          otp,
        },
      });
    } catch (error) {
      console.error("Error al guardar OTP:", error);
      throw new InternalServerErrorException("Error al guardar OTP");
    }
  }

  async sendOtp(phone: string) {
    const otp = this.generateOtp();
    await this.saveOtp(phone, otp);
    this.sendSms(phone, `Tu código de verificación es: ${otp}`);
  }

  async verifyOtp(phone: string, otp: string) {
    const otpRecord = await this.prismaService.smsOtp.findFirst({
      where: {
        phone,
        otp,
      },
    });

    if (otpRecord) {
      await this.prismaService.smsOtp.delete({
        where: {
          id: otpRecord.id,
        },
      });
      return true;
    }

    return false;
  }
}
