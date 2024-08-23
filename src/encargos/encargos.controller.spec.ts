import { Test, TestingModule } from '@nestjs/testing';
import { EncargosController } from './encargos.controller';

describe('EncargosController', () => {
  let controller: EncargosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EncargosController],
    }).compile();

    controller = module.get<EncargosController>(EncargosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
