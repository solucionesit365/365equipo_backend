import { Module } from '@nestjs/common';
import { PlanAusenciaService } from './plan-ausencia.service';

@Module({
  providers: [PlanAusenciaService]
})
export class PlanAusenciaModule {}
