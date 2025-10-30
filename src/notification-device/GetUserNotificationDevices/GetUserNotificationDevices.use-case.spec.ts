import { Test, TestingModule } from '@nestjs/testing';
import { GetUserNotificationDevicesUseCase } from './GetUserNotificationDevices.use-case';
import { INotificationDeviceRepository } from '../repository/INotificationDevice.repository';

describe('GetUserNotificationDevicesUseCase', () => {
  let useCase: GetUserNotificationDevicesUseCase;
  let repository: jest.Mocked<INotificationDeviceRepository>;

  beforeEach(async () => {
    const mockRepository = {
      getManyByTrabajador: jest.fn(),
      upsertOne: jest.fn(),
      deleteOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GetUserNotificationDevicesUseCase,
          useFactory: () => new GetUserNotificationDevicesUseCase(mockRepository as any),
        },
      ],
    }).compile();

    useCase = module.get<GetUserNotificationDevicesUseCase>(GetUserNotificationDevicesUseCase);
    repository = mockRepository as any;
  });

  describe('execute', () => {
    it('debe retornar dispositivos de notificación del usuario', async () => {
      const uid = 'user123';
      const mockDevices = [
        { id: 1, token: 'token1', trabajadorId: 'user123', createdAt: new Date() },
        { id: 2, token: 'token2', trabajadorId: 'user123', createdAt: new Date() },
      ];

      repository.getManyByTrabajador.mockResolvedValue(mockDevices as any);

      const result = await useCase.execute(uid);

      expect(result).toEqual(mockDevices);
      expect(repository.getManyByTrabajador).toHaveBeenCalledWith(uid);
    });

    it('debe retornar array vacío si no hay dispositivos', async () => {
      const uid = 'user123';

      repository.getManyByTrabajador.mockResolvedValue([]);

      const result = await useCase.execute(uid);

      expect(result).toEqual([]);
    });

    it('debe manejar errores del repositorio', async () => {
      const uid = 'user123';

      repository.getManyByTrabajador.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(uid)).rejects.toThrow('Database error');
    });
  });
});
