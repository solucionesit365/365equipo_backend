import { Module } from "@nestjs/common";
import { Fichajes } from "./fichajes.class";
import { FichajesDatabase } from "./fichajes.mongodb";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";
import { CuadrantesModule } from "../cuadrantes/cuadrantes.module";

@Module({
  imports: [TrabajadoresModule, CuadrantesModule],
  providers: [Fichajes, FichajesDatabase],
  exports: [Fichajes],
})
export class FichajesModule {}
