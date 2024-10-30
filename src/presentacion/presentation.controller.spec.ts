import { Test, TestingModule } from '@nestjs/testing';
import { PresentacionController } from './presentation.controller';

describe('PresentacionController', () => {
  let controller: PresentacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PresentacionController],
    }).compile();

    controller = module.get<PresentacionController>(PresentacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
