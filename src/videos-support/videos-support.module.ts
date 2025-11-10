import { Module } from "@nestjs/common";
import { VideosSupportService } from './videos-support.service';
import { VideosSupportController } from "./videos-support.controller";

@Module({
  controllers: [VideosSupportController],
  providers: [VideosSupportService],
})
export class VideosSupportModule {}
