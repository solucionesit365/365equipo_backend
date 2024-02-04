import { Module } from "@nestjs/common";
import { CalendarioFestivoService } from "./calendario-festivos.class";
import { CalendarioFestivosDatabase } from "./calendario-festivos.mongodb";
import { CalendarioFestivosController } from "./calendario-festivos.controller";

@Module({
  providers: [CalendarioFestivoService, CalendarioFestivosDatabase],
  exports: [CalendarioFestivoService],
  controllers: [CalendarioFestivosController],
})
export class CalendarioFestivosModule {}
