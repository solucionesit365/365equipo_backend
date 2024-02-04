import { Module, forwardRef } from "@nestjs/common";
import { FichajesValidadosService } from "./fichajes-validados.class";
import { FichajesValidadosDatabase } from "./fichajes-validados.mongodb";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";
import { FichajesValidadosController } from "./fichajes-validados.controller";
import { NotificacionesModule } from "../notificaciones/notificaciones.module";

@Module({
  imports: [forwardRef(() => TrabajadoresModule), NotificacionesModule],
  providers: [FichajesValidadosService, FichajesValidadosDatabase],
  exports: [FichajesValidadosService],
  controllers: [FichajesValidadosController],
})
export class FichajesValidadosModule {}
