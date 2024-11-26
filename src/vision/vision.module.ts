import { Module } from "@nestjs/common";
import { VisionService } from "./vision.service";
import { VisionController } from "./vision.controller";

@Module({
  providers: [VisionService],
  controllers: [VisionController],
})
export class VisionModule {}
