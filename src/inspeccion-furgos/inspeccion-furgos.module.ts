import { Module } from "@nestjs/common";
import { InspeccionFurgosController } from "./inspeccion-furgos.controller";
import { InspeccionFurgosClass } from "./inspeccion-furgos.class";
import { InspeccionFurgosDatabes } from "./inspeccion-furgos.mongodb";

@Module({
  controllers: [InspeccionFurgosController],
  exports: [InspeccionFurgosClass],
  providers: [InspeccionFurgosClass, InspeccionFurgosDatabes],
})
export class InspeccionFurgosModule {}
