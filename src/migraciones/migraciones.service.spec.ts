import { Test, TestingModule } from '@nestjs/testing';
import { MigracionesService } from './migraciones.service';

describe('MigracionesService', () => {
  let service: MigracionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MigracionesService],
    }).compile();

    service = module.get<MigracionesService>(MigracionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
