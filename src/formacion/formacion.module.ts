import { Module } from '@nestjs/common';
import { FormacionController } from './formacion.controller';
import { FormacionService } from './formacion.service';

@Module({
  controllers: [FormacionController],
  providers: [FormacionService]
})
export class FormacionModule {}
