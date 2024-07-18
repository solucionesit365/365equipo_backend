import { Test, TestingModule } from '@nestjs/testing';
import { TrabajadorPuestoService } from './trabajador-puesto.service';

describe('TrabajadorPuestoService', () => {
  let service: TrabajadorPuestoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrabajadorPuestoService],
    }).compile();

    service = module.get<TrabajadorPuestoService>(TrabajadorPuestoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
