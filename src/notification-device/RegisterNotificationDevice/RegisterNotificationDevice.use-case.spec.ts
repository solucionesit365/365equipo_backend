import { Test, TestingModule } from '@nestjs/testing';
import { RegisterNotificationDeviceUseCase } from './RegisterNotificationDevice.use-case';
import { INotificationDeviceRepository } from '../repository/INotificationDevice.repository';

describe('RegisterNotificationDeviceUseCase', () => {
  let useCase: RegisterNotificationDeviceUseCase;
  let repository: jest.Mocked<INotificationDeviceRepository>;

  beforeEach(async () => {
    const mockRepository = {
      upsertOne: jest.fn(),
      getManyByTrabajador: jest.fn(),
      deleteOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: RegisterNotificationDeviceUseCase,
          useFactory: () => new RegisterNotificationDeviceUseCase(mockRepository as any),
        },
      ],
    }).compile();

    useCase = module.get<RegisterNotificationDeviceUseCase>(RegisterNotificationDeviceUseCase);
    repository = mockRepository as any;
  });

  describe('execute', () => {
    it('debe registrar un dispositivo de notificación correctamente', async () => {
      const uid = 'user123';
      const deviceToken = 'token456';

      repository.upsertOne.mockResolvedValue(undefined);

      await useCase.execute(uid, deviceToken);

      expect(repository.upsertOne).toHaveBeenCalledWith(deviceToken, {
        token: deviceToken,
        trabajador: {
          connect: {
            idApp: uid,
          },
        },
      });
    });

    it('debe manejar errores del repositorio', async () => {
      const uid = 'user123';
      const deviceToken = 'token456';

      repository.upsertOne.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(uid, deviceToken)).rejects.toThrow('Database error');
    });
  });
});
