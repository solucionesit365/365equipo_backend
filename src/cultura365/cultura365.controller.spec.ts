import { Test, TestingModule } from '@nestjs/testing';
import { Cultura365Controller } from './cultura365.controller';

describe('Cultura365Controller', () => {
  let controller: Cultura365Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Cultura365Controller],
    }).compile();

    controller = module.get<Cultura365Controller>(Cultura365Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
