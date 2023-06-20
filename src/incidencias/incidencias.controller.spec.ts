import { Test, TestingModule } from '@nestjs/testing';
import { IncidenciasController } from './incidencias.controller';

describe('IncidenciasController', () => {
  let controller: IncidenciasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncidenciasController],
    }).compile();

    controller = module.get<IncidenciasController>(IncidenciasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
