import { Module } from "@nestjs/common";
import { PactadoVsRealService } from "./pactado-vs-real.service";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";
import { FichajesValidadosModule } from "../fichajes-validados/fichajes-validados.module";

@Module({
  imports: [TrabajadoresModule, FichajesValidadosModule],
  providers: [PactadoVsRealService],
  exports: [PactadoVsRealService],
})
export class PactadoVsRealModule {}
