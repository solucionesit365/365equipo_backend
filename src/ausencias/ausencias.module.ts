import { forwardRef, Module } from "@nestjs/common";
import { AusenciasService } from "./ausencias.class";
import { AusenciasDatabase } from "./ausencias.mongodb";
import { CuadrantesModule } from "../cuadrantes/cuadrantes.module";
import { AusenciasController } from "./ausencias.controller";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";
import { MBCTokenModule } from "../bussinesCentral/services/mbctoken/mbctoken.service.module";

@Module({
  imports: [
    CuadrantesModule,
    MBCTokenModule,
    forwardRef(() => TrabajadoresModule),
  ],
  providers: [AusenciasService, AusenciasDatabase],
  exports: [AusenciasService],
  controllers: [AusenciasController],
})
export class AusenciasModule {}
