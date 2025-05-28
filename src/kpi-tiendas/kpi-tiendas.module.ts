import { Module, forwardRef } from "@nestjs/common";
import { KpiTiendasClass } from "./kpi-tiendas.class";
import { KpiTiendasDatabase } from "./kpi-tiendas.mondodb";
import { KpiTiendasController } from "./kpi-tiendas.controller";
import { NotificacionesModule } from "../notificaciones/notificaciones.module";
import { TrabajadorModule } from "../trabajador/trabajador.module";

@Module({
  imports: [NotificacionesModule, forwardRef(() => TrabajadorModule)],
  providers: [KpiTiendasClass, KpiTiendasDatabase],
  exports: [KpiTiendasClass],
  controllers: [KpiTiendasController],
})
export class KpiTiendasModule {}
