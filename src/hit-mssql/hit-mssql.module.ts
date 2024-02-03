import { Global, Module } from "@nestjs/common";
import { HitMssqlService } from "./hit-mssql.service";

@Global()
@Module({
  providers: [HitMssqlService],
  exports: [HitMssqlService],
})
export class HitMssqlModule {}
