import { Module } from "@nestjs/common";
import { TestController } from "./test.controller";
// import { EmailModule } from "../email/email.module";
// import { FichajesValidadosModule } from "../fichajes-validados/fichajes-validados.module";
// import { TrabajadorModule } from "../trabajadores/trabajadores.module";
import { CuadrantesModule } from "../cuadrantes/cuadrantes.module";
// import { AusenciasModule } from "src/ausencias/ausencias.module";
// Cambio pequeño
@Module({
  // imports: [EmailModule, FichajesValidadosModule, TrabajadorModule],
  imports: [CuadrantesModule],
  controllers: [TestController],
})
export class TestModule {}
