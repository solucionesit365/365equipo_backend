import { Module } from '@nestjs/common';
import { TrabajadorPuestoService } from './trabajador-puesto.service';

@Module({
  providers: [TrabajadorPuestoService]
})
export class TrabajadorPuestoModule {}
