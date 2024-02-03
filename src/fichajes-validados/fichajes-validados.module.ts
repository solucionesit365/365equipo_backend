import { Module } from "@nestjs/common";
import { FichajesValidadosService } from "./fichajes-validados.class";
import { FichajesValidadosDatabase } from "./fichajes-validados.mongodb";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";

@Module({
  imports: [TrabajadoresModule],
  providers: [FichajesValidadosService, FichajesValidadosDatabase],
  exports: [FichajesValidadosService],
})
export class FichajesValidadosModule {}
