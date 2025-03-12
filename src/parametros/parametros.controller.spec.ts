import { Test, TestingModule } from '@nestjs/testing';
import { ParametrosController } from './parametros.controller';

describe('ParametrosController', () => {
  let controller: ParametrosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParametrosController],
    }).compile();

    controller = module.get<ParametrosController>(ParametrosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
