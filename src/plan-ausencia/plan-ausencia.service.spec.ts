import { Test, TestingModule } from '@nestjs/testing';
import { PlanAusenciaService } from './plan-ausencia.service';

describe('PlanAusenciaService', () => {
  let service: PlanAusenciaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanAusenciaService],
    }).compile();

    service = module.get<PlanAusenciaService>(PlanAusenciaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
