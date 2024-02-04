import { Module } from "@nestjs/common";
import { ArchivoDigitalService } from "./archivo-digital.class";
import { ArchivoDigitalDatabase } from "./archivo-digital.mongodb";
import { ArchivoDigitalController } from "./archivo-digital.controller";

@Module({
  providers: [ArchivoDigitalService, ArchivoDigitalDatabase],
  exports: [ArchivoDigitalService],
  controllers: [ArchivoDigitalController],
})
export class ArchivoDigitalModule {}
