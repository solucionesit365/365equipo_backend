import { Test, TestingModule } from '@nestjs/testing';
import { HitMssqlService } from './hit-mssql.service';

describe('HitMssqlService', () => {
  let service: HitMssqlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HitMssqlService],
    }).compile();

    service = module.get<HitMssqlService>(HitMssqlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
