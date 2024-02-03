import { Module } from "@nestjs/common";
import { Nominas } from "./nominas.class";
import { NominasDatabase } from "./nominas.database";

@Module({
  providers: [Nominas, NominasDatabase],
  exports: [Nominas],
})
export class NominasModule {}
