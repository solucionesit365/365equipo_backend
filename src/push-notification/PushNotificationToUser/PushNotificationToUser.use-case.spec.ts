import { Test, TestingModule } from '@nestjs/testing';
import { PushNotificationToUserUseCase } from './PushNotificationToUser.use-case';
import { INotificationDeviceRepository } from '../../notification-device/repository/INotificationDevice.repository';
import { FirebaseService } from '../../firebase/firebase.service';

describe('PushNotificationToUserUseCase', () => {
  let useCase: PushNotificationToUserUseCase;
  let repository: jest.Mocked<INotificationDeviceRepository>;
  let firebaseService: jest.Mocked<FirebaseService>;

  beforeEach(async () => {
    const mockRepository = {
      getManyByTrabajador: jest.fn(),
      deleteOneByToken: jest.fn(),
    };

    const mockFirebaseService = {
      sendPushToToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PushNotificationToUserUseCase,
          useFactory: () => new PushNotificationToUserUseCase(mockRepository as any, mockFirebaseService as any),
        },
      ],
    }).compile();

    useCase = module.get<PushNotificationToUserUseCase>(PushNotificationToUserUseCase);
    repository = mockRepository as any;
    firebaseService = mockFirebaseService as any;
  });

  describe('execute', () => {
    it('debe enviar notificaciones a todos los dispositivos del usuario', async () => {
      const uid = 'user123';
      const notification = {
        title: 'Test Title',
        body: 'Test Body',
        link: '/test',
        iconUrl: 'https://example.com/icon.png',
      };

      const mockDevices = [
        { id: 1, token: 'token1', trabajadorId: uid },
        { id: 2, token: 'token2', trabajadorId: uid },
      ];

      repository.getManyByTrabajador.mockResolvedValue(mockDevices as any);
      firebaseService.sendPushToToken.mockResolvedValue(undefined);

      await useCase.execute(uid, notification);

      expect(repository.getManyByTrabajador).toHaveBeenCalledWith(uid);
      expect(firebaseService.sendPushToToken).toHaveBeenCalledTimes(2);
    });

    it('debe eliminar dispositivo si falla el envío', async () => {
      const uid = 'user123';
      const notification = {
        title: 'Test',
        body: 'Test',
        link: '/test',
      };

      const mockDevices = [{ id: 1, token: 'invalid-token', trabajadorId: uid }];

      repository.getManyByTrabajador.mockResolvedValue(mockDevices as any);
      firebaseService.sendPushToToken.mockRejectedValue(new Error('Invalid token'));

      await useCase.execute(uid, notification);

      expect(repository.deleteOneByToken).toHaveBeenCalledWith('invalid-token');
    });
  });
});
