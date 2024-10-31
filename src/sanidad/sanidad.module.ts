import { Module } from '@nestjs/common';
import { SanidadController } from './sanidad.controller';
import { SanidadService } from './sanidad.service';

@Module({
  controllers: [SanidadController],
  providers: [SanidadService]
})
export class SanidadModule {}
