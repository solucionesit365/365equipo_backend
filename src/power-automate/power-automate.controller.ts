import { Body, Controller, Post } from "@nestjs/common";
import { TestDto } from "./power-automate.dto";
import { MongoService } from "../mongo/mongo.service";

@Controller("power-automate")
export class PowerAutomateController {
  constructor(private readonly mongoService: MongoService) {}

  @Post("test")
  async test(@Body() req: TestDto) {
    try {
      const db = (await this.mongoService.getConexion()).db("soluciones");
      const powerAutomateCollection = db.collection("power-automate");
      await powerAutomateCollection.insertOne(req);
      return "OK";
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}
