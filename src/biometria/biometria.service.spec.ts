import { Test, TestingModule } from '@nestjs/testing';
import { BiometriaService } from './biometria.service';

describe('BiometriaService', () => {
  let service: BiometriaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BiometriaService],
    }).compile();

    service = module.get<BiometriaService>(BiometriaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
