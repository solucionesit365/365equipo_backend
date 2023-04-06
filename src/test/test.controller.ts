import { Controller, Get } from "@nestjs/common";
import axios from "axios";
import * as moment from "moment";

@Controller("test")
export class TestController {
  @Get()
  test() {
    const prueba = moment().week(14).weekday(6).format("DD/MM/YYYY");
    return prueba;
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
