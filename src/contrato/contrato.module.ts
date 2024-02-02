import { Module } from "@nestjs/common";
import { ContratoService } from "./contrato.service";
import { ContratoController } from "./contrato.controller";
import { HitMssqlModule } from "../hit-mssql/hit-mssql.module";

@Module({
  providers: [ContratoService],
  controllers: [ContratoController],
  imports: [HitMssqlModule],
})
export class ContratoModule {}
