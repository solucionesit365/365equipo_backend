import { Test, TestingModule } from '@nestjs/testing';
import { SanidadService } from './sanidad.service';

describe('SanidadService', () => {
  let service: SanidadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SanidadService],
    }).compile();

    service = module.get<SanidadService>(SanidadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
