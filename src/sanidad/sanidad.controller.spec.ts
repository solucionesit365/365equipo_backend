import { Test, TestingModule } from '@nestjs/testing';
import { SanidadController } from './sanidad.controller';

describe('SanidadController', () => {
  let controller: SanidadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SanidadController],
    }).compile();

    controller = module.get<SanidadController>(SanidadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
