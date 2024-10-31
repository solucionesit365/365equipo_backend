import { Module, forwardRef } from "@nestjs/common";
import { KpiTiendasClass } from "./kpi-tiendas.class";
import { KpiTiendasDatabase } from "./kpi-tiendas.mondodb";
import { KpiTiendasController } from "./kpi-tiendas.controller";
import { NotificacionesModule } from "../notificaciones/notificaciones.module";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";

@Module({
  imports: [NotificacionesModule, forwardRef(() => TrabajadoresModule)],
  providers: [KpiTiendasClass, KpiTiendasDatabase],
  exports: [KpiTiendasClass],
  controllers: [KpiTiendasController],
})
export class KpiTiendasModule {}
