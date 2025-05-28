import { Module, forwardRef } from "@nestjs/common";
import { Cuadrantes } from "./cuadrantes.class";
import { CuadrantesDatabase } from "./cuadrantes.mongodb";
import { ContratoModule } from "../contrato/contrato.module";
import { TiendaModule } from "../tienda/tienda.module";
import { TrabajadorModule } from "../trabajador/trabajador.module";
import { FichajesValidadosModule } from "../fichajes-validados/fichajes-validados.module";
import { CuadrantesController } from "./cuadrantes.controller";
import { NotificacionesModule } from "../notificaciones/notificaciones.module";
@Module({
  imports: [
    ContratoModule,
    forwardRef(() => TiendaModule),
    forwardRef(() => TrabajadorModule),
    forwardRef(() => NotificacionesModule),
    FichajesValidadosModule,
  ],
  providers: [Cuadrantes, CuadrantesDatabase],
  controllers: [CuadrantesController],
  exports: [Cuadrantes],
})
export class CuadrantesModule {}
