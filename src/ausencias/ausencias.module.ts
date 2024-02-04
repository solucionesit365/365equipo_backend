import { Module } from "@nestjs/common";
import { AusenciasService } from "./ausencias.class";
import { AusenciasDatabase } from "./ausencias.mongodb";
import { CuadrantesModule } from "../cuadrantes/cuadrantes.module";
import { AusenciasController } from "./ausencias.controller";

@Module({
  imports: [CuadrantesModule],
  providers: [AusenciasService, AusenciasDatabase],
  exports: [AusenciasService],
  controllers: [AusenciasController],
})
export class AusenciasModule {}
