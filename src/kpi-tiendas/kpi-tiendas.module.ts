import { Module } from "@nestjs/common";
import { KpiTiendasClass } from "./kpi-tiendas.class";
import { KpiTiendasDatabase } from "./kpi-tiendas.mondodb";
import { KpiTiendasController } from "./kpi-tiendas.controller";

@Module({
  providers: [KpiTiendasClass, KpiTiendasDatabase],
  exports: [KpiTiendasClass],
  controllers: [KpiTiendasController],
})
export class KpiTiendasModule {}
