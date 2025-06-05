import { Module } from '@nestjs/common';
import { RegistroService } from './registro.service';

@Module({
  providers: [RegistroService]
})
export class RegistroModule {}
