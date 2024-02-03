import { Module } from "@nestjs/common";
import { EmailService } from "./email.class";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";

@Module({
  imports: [TrabajadoresModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
