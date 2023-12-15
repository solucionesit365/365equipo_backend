import { Test, TestingModule } from '@nestjs/testing';
import { PactadoVsRealService } from './pactado-vs-real.service';

describe('PactadoVsRealService', () => {
  let service: PactadoVsRealService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PactadoVsRealService],
    }).compile();

    service = module.get<PactadoVsRealService>(PactadoVsRealService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
