import { Test, TestingModule } from '@nestjs/testing';
import { ColorSemanalController } from './color-semanal.controller';

describe('ColorSemanalController', () => {
  let controller: ColorSemanalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColorSemanalController],
    }).compile();

    controller = module.get<ColorSemanalController>(ColorSemanalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
