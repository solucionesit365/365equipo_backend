import { Test, TestingModule } from '@nestjs/testing';
import { PerfilHardwareService } from './perfil-hardware.service';

describe('PerfilHardwareService', () => {
  let service: PerfilHardwareService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PerfilHardwareService],
    }).compile();

    service = module.get<PerfilHardwareService>(PerfilHardwareService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
