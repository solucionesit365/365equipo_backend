import { Test, TestingModule } from '@nestjs/testing';
import { VideosFormacionController } from './videos-formacion.controller';

describe('VideosFormacionController', () => {
  let controller: VideosFormacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideosFormacionController],
    }).compile();

    controller = module.get<VideosFormacionController>(VideosFormacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
