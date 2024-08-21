import { Test, TestingModule } from '@nestjs/testing';
import { EncargosService } from './encargos.service';

describe('EncargosService', () => {
  let service: EncargosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EncargosService],
    }).compile();

    service = module.get<EncargosService>(EncargosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
