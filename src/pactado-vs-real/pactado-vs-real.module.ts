import { Module } from "@nestjs/common";
import { PactadoVsRealService } from "./pactado-vs-real.service";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";
import { FichajesValidadosModule } from "../fichajes-validados/fichajes-validados.module";
import { PactadoVsRealController } from "./pactado-vs-real.controller";
import { AusenciasModule } from "../ausencias/ausencias.module";
import { CuadrantesModule } from "../cuadrantes/cuadrantes.module";
import { TurnoModule } from "../turno/turno.module";

@Module({
  imports: [
    TrabajadoresModule,
    FichajesValidadosModule,
    AusenciasModule,
    CuadrantesModule,
    TurnoModule,
  ],
  providers: [PactadoVsRealService],
  exports: [PactadoVsRealService],
  controllers: [PactadoVsRealController],
})
export class PactadoVsRealModule {}
