import { Test, TestingModule } from '@nestjs/testing';
import { CuadrantesController } from './cuadrantes.controller';

describe('CuadrantesController', () => {
  let controller: CuadrantesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CuadrantesController],
    }).compile();

    controller = module.get<CuadrantesController>(CuadrantesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
