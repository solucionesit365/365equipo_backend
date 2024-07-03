import { Test, TestingModule } from '@nestjs/testing';
import { ParFichajeController } from './par-fichaje.controller';

describe('ParFichajeController', () => {
  let controller: ParFichajeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParFichajeController],
    }).compile();

    controller = module.get<ParFichajeController>(ParFichajeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
