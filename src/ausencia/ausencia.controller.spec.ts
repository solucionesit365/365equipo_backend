import { Test, TestingModule } from '@nestjs/testing';
import { AusenciaController } from './ausencia.controller';

describe('AusenciaController', () => {
  let controller: AusenciaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AusenciaController],
    }).compile();

    controller = module.get<AusenciaController>(AusenciaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
