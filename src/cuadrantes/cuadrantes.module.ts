import { Module, forwardRef } from "@nestjs/common";
import { Cuadrantes } from "./cuadrantes.class";
import { CuadrantesDatabase } from "./cuadrantes.mongodb";
import { ContratoModule } from "../contrato/contrato.module";
import { TiendasModule } from "../tiendas/tiendas.module";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";
import { FichajesValidadosModule } from "../fichajes-validados/fichajes-validados.module";
// import { CuadrantesController } from "./cuadrantes.controller";
import { NotificacionesModule } from "../notificaciones/notificaciones.module";
@Module({
  imports: [
    forwardRef(() => ContratoModule),
    forwardRef(() => TiendasModule),
    forwardRef(() => TrabajadoresModule),
    forwardRef(() => NotificacionesModule),
    FichajesValidadosModule,
  ],
  providers: [Cuadrantes, CuadrantesDatabase],
  controllers: [],
  exports: [Cuadrantes],
})
export class CuadrantesModule {}
