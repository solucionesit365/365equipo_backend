import { Test, TestingModule } from '@nestjs/testing';
import { FichajesController } from './fichajes.controller';

describe('FichajesController', () => {
  let controller: FichajesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FichajesController],
    }).compile();

    controller = module.get<FichajesController>(FichajesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
