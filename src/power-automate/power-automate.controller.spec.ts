import { Test, TestingModule } from '@nestjs/testing';
import { PowerAutomateController } from './power-automate.controller';

describe('PowerAutomateController', () => {
  let controller: PowerAutomateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PowerAutomateController],
    }).compile();

    controller = module.get<PowerAutomateController>(PowerAutomateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
