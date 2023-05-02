import { Test, TestingModule } from '@nestjs/testing';
import { AusenciasController } from './ausencias.controller';

describe('AusenciasController', () => {
  let controller: AusenciasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AusenciasController],
    }).compile();

    controller = module.get<AusenciasController>(AusenciasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
