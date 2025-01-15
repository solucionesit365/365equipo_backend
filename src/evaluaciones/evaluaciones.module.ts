import { forwardRef, Module } from "@nestjs/common";
import { EvaluacionesService } from "./evaluaciones.class";
import { EvaluacionesDatabase } from "./evaluaciones.mongodb";
import { EvaluacionesController } from "./evaluaciones.controller";
import { TrabajadoresModule } from "src/trabajadores/trabajadores.module";

@Module({
  imports: [forwardRef(() => TrabajadoresModule)],
  providers: [EvaluacionesService, EvaluacionesDatabase],
  exports: [EvaluacionesService],
  controllers: [EvaluacionesController],
})
export class EvaluacionesModule {}
