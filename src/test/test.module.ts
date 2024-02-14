import { Module } from "@nestjs/common";
import { TestController } from "./test.controller";
// import { EmailModule } from "../email/email.module";
// import { FichajesValidadosModule } from "../fichajes-validados/fichajes-validados.module";
// import { TrabajadoresModule } from "../trabajadores/trabajadores.module";
import { CuadrantesModule } from "../cuadrantes/cuadrantes.module";

@Module({
  // imports: [EmailModule, FichajesValidadosModule, TrabajadoresModule],
  imports: [CuadrantesModule],
  controllers: [TestController],
})
export class TestModule {}
