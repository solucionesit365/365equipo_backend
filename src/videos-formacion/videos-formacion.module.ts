import { Module } from "@nestjs/common";
import { VideosFormacionController } from "./videos-formacion.controller";
import { videosFormacion365Mongo } from "./videos-formacion.mongodb";
import { videosFormacion365Class } from "./videos-formacion.class";

@Module({
  controllers: [VideosFormacionController],
  providers: [videosFormacion365Mongo, videosFormacion365Class],
})
export class VideosFormacionModule {}
