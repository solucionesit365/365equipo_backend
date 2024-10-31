import { Module } from "@nestjs/common";
import { HardwareController } from "./hardware.controller";
import { HardwareService } from "./hardware.service";
import { HardwareDatabase } from "./hardware.mongodb";

@Module({
  controllers: [HardwareController],
  exports: [HardwareService],
  providers: [HardwareService, HardwareDatabase],
})
export class HardwareModule {}
