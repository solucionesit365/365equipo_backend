import { Module } from "@nestjs/common";
import { PactadoVsRealService } from "./pactado-vs-real.service";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";
import { FichajesValidadosModule } from "../fichajes-validados/fichajes-validados.module";
import { PactadoVsRealController } from "./pactado-vs-real.controller";

@Module({
  imports: [TrabajadoresModule, FichajesValidadosModule],
  providers: [PactadoVsRealService],
  exports: [PactadoVsRealService],
  controllers: [PactadoVsRealController],
})
export class PactadoVsRealModule {}
