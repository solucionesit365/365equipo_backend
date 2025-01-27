import { Module } from '@nestjs/common';
import { PowerAutomateController } from './power-automate.controller';
import { PowerAutomateService } from './power-automate.service';

@Module({
  controllers: [PowerAutomateController],
  providers: [PowerAutomateService]
})
export class PowerAutomateModule {}
