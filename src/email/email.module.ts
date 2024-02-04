import { Module } from "@nestjs/common";
import { EmailService } from "./email.class";

@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
