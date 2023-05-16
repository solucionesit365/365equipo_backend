import { Controller, Get } from "@nestjs/common";
import axios from "axios";
import { EmailClass } from "../email/email.class";

@Controller("test")
export class TestController {
  constructor(private readonly emailInstance: EmailClass) {}
  @Get()
  test() {
    this.emailInstance.enviarEmail(
      "ezequiel@solucionesit365.com",
      "Mensaje aquí",
      "Asunto super importante",
    );
    return true;
  }

  @Get("ip")
  async getIp(): Promise<string> {
    try {
      console.log("modificación para slack2");
      const response = await axios.get("https://api.ipify.org?format=json");
      return response.data.ip;
    } catch (error) {
      console.error("Error fetching IP:", error);
      throw new Error("Failed to fetch IP address");
    }
  }
}
