import { Module } from "@nestjs/common";
import { Cuadrantes } from "./cuadrantes.class";
import { CuadrantesDatabase } from "./cuadrantes.mongodb";
import { ContratoModule } from "../contrato/contrato.module";
import { TiendasModule } from "../tiendas/tiendas.module";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";
import { FichajesValidadosModule } from "../fichajes-validados/fichajes-validados.module";

@Module({
  imports: [
    ContratoModule,
    TiendasModule,
    TrabajadoresModule,
    FichajesValidadosModule,
  ],
  providers: [Cuadrantes, CuadrantesDatabase],
  controllers: [Cuadrantes],
})
export class CuadrantesModule {}
