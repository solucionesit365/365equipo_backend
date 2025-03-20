import { Module } from "@nestjs/common";
import { PowerAutomateController } from "./power-automate.controller";
import { PowerAutomateService } from "./power-automate.service";
import { EmailModule } from "../email/email.module";

@Module({
  imports: [EmailModule],
  controllers: [PowerAutomateController],
  providers: [PowerAutomateService],
})
export class PowerAutomateModule {}
