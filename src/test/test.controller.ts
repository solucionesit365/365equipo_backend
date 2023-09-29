import { Controller, Get } from "@nestjs/common";
import axios from "axios";
// import { EmailClass } from "../email/email.class";
import { DateTime } from "luxon";

@Controller("test")
export class TestController {
  // constructor(private readonly emailInstance: EmailClass) {}
  @Get()
  test() {
    const lol = DateTime.fromMillis(957176963000);
    const waw = DateTime.fromFormat("01/05/1994", "dd/MM/yyyy");
    const diff = lol.diff(waw, "days");
    const jaaj = lol.minus({ days: 10545 });

    return (
      lol.toFormat("dd/MM/yyyy") +
      " " +
      waw.toFormat("dd/MM/yyyy") +
      " " +
      jaaj.toFormat("dd/MM/yyyy") +
      " " +
      diff.get("days")
    );
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
