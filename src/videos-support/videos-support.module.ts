import { Module } from "@nestjs/common";
import { VideosSupportController } from "./videos-support.controller";

@Module({
  controllers: [VideosSupportController],
})
export class VideosSupportModule {}
