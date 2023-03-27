import { Test, TestingModule } from '@nestjs/testing';
import { VacacionesController } from './vacaciones.controller';

describe('VacacionesController', () => {
  let controller: VacacionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VacacionesController],
    }).compile();

    controller = module.get<VacacionesController>(VacacionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
