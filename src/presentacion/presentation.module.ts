import { Module } from "@nestjs/common";
import { PresentationController } from "./presentation.controller";
import { PresentationService } from "./presentation.service";

@Module({
  controllers: [PresentationController],
  providers: [PresentationService],
})
export class PresentationModule {}
