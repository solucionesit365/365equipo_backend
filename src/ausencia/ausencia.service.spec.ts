import { Test, TestingModule } from '@nestjs/testing';
import { AusenciaService } from './ausencia.service';

describe('AusenciaService', () => {
  let service: AusenciaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AusenciaService],
    }).compile();

    service = module.get<AusenciaService>(AusenciaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
