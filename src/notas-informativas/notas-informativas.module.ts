import { Module, forwardRef } from "@nestjs/common";
import { NotasInformativasController } from "./notas-informativas.controller";
import { NotasInformativasDatabaseService } from "./notas-informativas.mongodb";
import { NotasInformativasClass } from "./notas-informativas.class";
import { NotificacionesModule } from "../notificaciones/notificaciones.module";
import { TrabajadorModule } from "../trabajador/trabajador.module";

@Module({
  imports: [NotificacionesModule, forwardRef(() => TrabajadorModule)],
  providers: [NotasInformativasClass, NotasInformativasDatabaseService],
  exports: [NotasInformativasClass],
  controllers: [NotasInformativasController],
})
export class NotasInformativasModule {}
