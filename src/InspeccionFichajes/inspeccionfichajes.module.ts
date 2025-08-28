/*
https://docs.nestjs.com/modules
*/

import { Module } from "@nestjs/common";
import { InspeccionFichajesController } from "./inspeccionfichajes.controller";
import { InspeccionFichajesService } from "./inspeccionfichajes.service";

@Module({
  imports: [],
  controllers: [InspeccionFichajesController],
  exports: [InspeccionFichajesService],
  providers: [InspeccionFichajesService],
})
export class InspeccionFichajesModule {}
