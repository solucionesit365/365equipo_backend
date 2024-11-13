import { Module } from "@nestjs/common";
import { FormacionController } from "./formacion.controller";
import { FormacionService } from "./formacion.service";
import { EmailModule } from "../email/email.module";

@Module({
  imports: [EmailModule],
  controllers: [FormacionController],
  providers: [FormacionService],
})
export class FormacionModule {}
