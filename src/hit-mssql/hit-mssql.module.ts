import { Module } from "@nestjs/common";
import { HitMssqlService } from "./hit-mssql.service";

@Module({
  providers: [HitMssqlService],
  exports: [HitMssqlService],
})
export class HitMssqlModule {}
