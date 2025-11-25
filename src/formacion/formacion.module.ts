import { Module } from "@nestjs/common";
import { FormacionController } from "./formacion.controller";
import { FormacionService } from "./formacion.service";
import { EmailModule } from "../email/email.module";
import { CompletedFormationsModule } from './completed-formations/completed-formations.module';

@Module({
  imports: [EmailModule, CompletedFormationsModule],
  controllers: [FormacionController],
  providers: [FormacionService],
})
export class FormacionModule {}
