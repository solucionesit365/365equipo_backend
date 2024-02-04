import { Module, forwardRef } from "@nestjs/common";
import { Cuadrantes } from "./cuadrantes.class";
import { CuadrantesDatabase } from "./cuadrantes.mongodb";
import { ContratoModule } from "../contrato/contrato.module";
import { TiendasModule } from "../tiendas/tiendas.module";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";
import { FichajesValidadosModule } from "../fichajes-validados/fichajes-validados.module";
import { CuadrantesController } from "./cuadrantes.controller";

@Module({
  imports: [
    ContratoModule,
    forwardRef(() => TiendasModule),
    forwardRef(() => TrabajadoresModule),
    FichajesValidadosModule,
  ],
  providers: [Cuadrantes, CuadrantesDatabase],
  controllers: [CuadrantesController],
  exports: [Cuadrantes],
})
export class CuadrantesModule {}
