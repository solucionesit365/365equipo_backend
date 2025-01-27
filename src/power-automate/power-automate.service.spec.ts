import { Test, TestingModule } from '@nestjs/testing';
import { PowerAutomateService } from './power-automate.service';

describe('PowerAutomateService', () => {
  let service: PowerAutomateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PowerAutomateService],
    }).compile();

    service = module.get<PowerAutomateService>(PowerAutomateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
