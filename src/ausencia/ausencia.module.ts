import { Module } from '@nestjs/common';
import { AusenciaController } from './ausencia.controller';
import { AusenciaService } from './ausencia.service';

@Module({
  controllers: [AusenciaController],
  providers: [AusenciaService]
})
export class AusenciaModule {}
