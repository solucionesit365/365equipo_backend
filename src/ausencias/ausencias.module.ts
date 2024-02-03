import { Module } from "@nestjs/common";
import { AusenciasService } from "./ausencias.class";
import { AusenciasDatabase } from "./ausencias.mongodb";
import { CuadrantesModule } from "../cuadrantes/cuadrantes.module";

@Module({
  imports: [CuadrantesModule],
  providers: [AusenciasService, AusenciasDatabase],
  exports: [AusenciasService],
})
export class AusenciasModule {}
