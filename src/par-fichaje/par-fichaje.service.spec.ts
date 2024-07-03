import { Test, TestingModule } from '@nestjs/testing';
import { ParFichajeService } from './par-fichaje.service';

describe('ParFichajeService', () => {
  let service: ParFichajeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParFichajeService],
    }).compile();

    service = module.get<ParFichajeService>(ParFichajeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
