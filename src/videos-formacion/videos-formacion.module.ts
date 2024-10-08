import { Module, forwardRef } from "@nestjs/common";
import { VideosFormacionController } from "./videos-formacion.controller";
import { videosFormacion365Mongo } from "./videos-formacion.mongodb";
import { videosFormacion365Class } from "./videos-formacion.class";
import { NotificacionesModule } from "../notificaciones/notificaciones.module";
import { TrabajadoresModule } from "../trabajadores/trabajadores.module";

@Module({
  imports: [NotificacionesModule, forwardRef(() => TrabajadoresModule)],
  controllers: [VideosFormacionController],
  providers: [videosFormacion365Mongo, videosFormacion365Class],
})
export class VideosFormacionModule {}
