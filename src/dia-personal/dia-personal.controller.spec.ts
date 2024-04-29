import { Test, TestingModule } from '@nestjs/testing';
import { DiaPersonalController } from './dia-personal.controller';

describe('DiaPersonalController', () => {
  let controller: DiaPersonalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiaPersonalController],
    }).compile();

    controller = module.get<DiaPersonalController>(DiaPersonalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
