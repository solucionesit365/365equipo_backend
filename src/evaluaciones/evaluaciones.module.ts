import { Module } from "@nestjs/common";
import { EvaluacionesService } from "./evaluaciones.class";
import { EvaluacionesDatabase } from "./evaluaciones.mongodb";
import { EvaluacionesController } from "./evaluaciones.controller";

@Module({
  providers: [EvaluacionesService, EvaluacionesDatabase],
  exports: [EvaluacionesService],
  controllers: [EvaluacionesController],
})
export class EvaluacionesModule {}
