import { Module } from '@nestjs/common';
import { MacroService } from './macro.service';
import { MacroController } from './macro.controller';

@Module({
  providers: [MacroService],
  controllers: [MacroController]
})
export class MacroModule {}
