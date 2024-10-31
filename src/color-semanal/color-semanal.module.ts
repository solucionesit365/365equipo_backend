import { Module } from '@nestjs/common';
import { ColorSemanalController } from './color-semanal.controller';
import { ColorSemanalService } from './color-semanal.service';

@Module({
  controllers: [ColorSemanalController],
  providers: [ColorSemanalService]
})
export class ColorSemanalModule {}
