import { Module } from "@nestjs/common";
import { TestController } from "./test.controller";
import { EmailModule } from "../email/email.module";
import { FichajesValidadosModule } from "../fichajes-validados/fichajes-validados.module";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";

@Module({
  imports: [EmailModule, FichajesValidadosModule, TrabajadoresModule],
  controllers: [TestController],
})
export class TestModule {}
