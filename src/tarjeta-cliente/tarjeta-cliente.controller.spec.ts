import { Test, TestingModule } from '@nestjs/testing';
import { TarjetaClienteController } from './tarjeta-cliente.controller';

describe('TarjetaClienteController', () => {
  let controller: TarjetaClienteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TarjetaClienteController],
    }).compile();

    controller = module.get<TarjetaClienteController>(TarjetaClienteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
