import { Module } from "@nestjs/common";
import { VideosSupportController } from "./videos-support.controller";
import { VideosSupportClass } from "./videos-support.class";
import { VideosSupportDatabases } from "./videos-support.mongodb";

@Module({
  imports: [VideosSupportModule],
  controllers: [VideosSupportController],
  providers: [VideosSupportClass, VideosSupportDatabases],
  exports: [VideosSupportClass],
})
export class VideosSupportModule {}
