import { Test, TestingModule } from '@nestjs/testing';
import { TiendasController } from './tiendas.controller';

describe('TiendasController', () => {
  let controller: TiendasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TiendasController],
    }).compile();

    controller = module.get<TiendasController>(TiendasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
