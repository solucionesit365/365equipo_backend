import { Module } from "@nestjs/common";
import { EvaluacionesService } from "./evaluaciones.class";
import { EvaluacionesDatabase } from "./evaluaciones.mongodb";

@Module({
  providers: [EvaluacionesService, EvaluacionesDatabase],
  exports: [EvaluacionesService],
  controllers: [],
})
export class EvaluacionesModule {}
