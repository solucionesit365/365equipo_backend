import { Module } from "@nestjs/common";
import { Fichajes } from "./fichajes.class";
import { FichajesDatabase } from "./fichajes.mongodb";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";
import { CuadrantesModule } from "../cuadrantes/cuadrantes.module";
import { FichajesController } from "./fichajes.controller";

@Module({
  imports: [TrabajadoresModule, CuadrantesModule],
  providers: [Fichajes, FichajesDatabase],
  exports: [Fichajes],
  controllers: [FichajesController],
})
export class FichajesModule {}
