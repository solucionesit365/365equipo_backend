import { Test, TestingModule } from '@nestjs/testing';
import { FormacionService } from './formacion.service';

describe('FormacionService', () => {
  let service: FormacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FormacionService],
    }).compile();

    service = module.get<FormacionService>(FormacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
