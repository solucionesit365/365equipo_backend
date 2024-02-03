import { Module } from "@nestjs/common";
import { ArchivoDigitalService } from "./archivo-digital.class";
import { ArchivoDigitalDatabase } from "./archivo-digital.mongodb";

@Module({
  providers: [ArchivoDigitalService, ArchivoDigitalDatabase],
  exports: [ArchivoDigitalService],
})
export class ArchivoDigitalModule {}
