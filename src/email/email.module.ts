import { Module, Global } from "@nestjs/common";
import { EmailService } from "./email.class";

@Global()
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
