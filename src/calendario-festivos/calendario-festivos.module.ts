import { Module } from "@nestjs/common";
import { CalendarioFestivoService } from "./calendario-festivos.class";
import { CalendarioFestivosDatabase } from "./calendario-festivos.mongodb";

@Module({
  providers: [CalendarioFestivoService, CalendarioFestivosDatabase],
  exports: [CalendarioFestivoService],
})
export class CalendarioFestivosModule {}
