/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common";
import { ParametrosService } from "./parametros.service";
import { ParametrosController } from "./parametros.controller";
import { ParametrosDatabase } from "./parametros.mongodb";

@Module({
  providers: [ParametrosService, ParametrosDatabase],
  controllers: [ParametrosController],
  exports: [ParametrosService],
})
export class ParametrosModule {}

