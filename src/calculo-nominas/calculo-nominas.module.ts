import { Module } from "@nestjs/common";
import { CalculoNominasController } from "./calculo-nominas.controller";
import { CalculoNominasService } from "./calculo-nominas.service";
import { NotificacionHorasExtrasModule } from "src/notificacion-horas-extras/notificacion-horas-extras.module";
import { CalendarioFestivosModule } from "src/calendario-festivos/calendario-festivos.module";
import { FichajesModule } from "src/fichajes-bc/fichajes.module";
import { TrabajadoresModule } from "src/trabajadores/trabajadores.module";

@Module({
  imports: [
    NotificacionHorasExtrasModule,
    CalendarioFestivosModule,
    FichajesModule,
    TrabajadoresModule,
  ],
  providers: [CalculoNominasService],
  exports: [CalculoNominasService],
  controllers: [CalculoNominasController],
})
export class CalculoNominasModule {}
