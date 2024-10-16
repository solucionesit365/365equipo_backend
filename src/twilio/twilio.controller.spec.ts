import { Test, TestingModule } from '@nestjs/testing';
import { TwilioController } from './twilio.controller';

describe('TwilioController', () => {
  let controller: TwilioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TwilioController],
    }).compile();

    controller = module.get<TwilioController>(TwilioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
