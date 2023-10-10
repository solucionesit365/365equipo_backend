import { Test, TestingModule } from '@nestjs/testing';
import { MantenimientoController } from './mantenimiento.controller';

describe('MantenimientoController', () => {
  let controller: MantenimientoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MantenimientoController],
    }).compile();

    controller = module.get<MantenimientoController>(MantenimientoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
