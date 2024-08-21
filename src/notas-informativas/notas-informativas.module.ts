import { Module } from "@nestjs/common";
import { NotasInformativasController } from "./notas-informativas.controller";
import { NotasInformativasDatabes } from "./notas-informativas.mongodb";
import { NotasInformativasClass } from "./notas-informativas.class";

@Module({
  providers: [NotasInformativasClass, NotasInformativasDatabes],
  exports: [NotasInformativasClass],
  controllers: [NotasInformativasController],
})
export class NotasInformativasModule {}
