import { Test, TestingModule } from '@nestjs/testing';
import { Notificaciones } from './notificaciones.class';
import { NotificacionsDatabase } from './notificaciones.mongodb';
import axios from 'axios';

jest.mock('axios');
jest.mock('firebase-admin', () => ({
  messaging: () => ({
    subscribeToTopic: jest.fn().mockResolvedValue(true),
    send: jest.fn().mockResolvedValue('message-id'),
  }),
}));

describe('Notificaciones', () => {
  let service: Notificaciones;
  let database: jest.Mocked<NotificacionsDatabase>;

  beforeEach(async () => {
    const mockDatabase = {
      saveToken: jest.fn(),
      newInAppNotification: jest.fn(),
      deleteInAppNotification: jest.fn(),
      getInAppNotifications: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Notificaciones,
        { provide: NotificacionsDatabase, useValue: mockDatabase },
      ],
    }).compile();

    service = module.get<Notificaciones>(Notificaciones);
    database = module.get(NotificacionsDatabase);

    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('saveToken', () => {
    it('debe guardar el token correctamente', async () => {
      const mockUid = 'user123';
      const mockToken = 'fcm-token-123';

      database.saveToken.mockResolvedValue(true);

      const result = await service.saveToken(mockUid, mockToken);

      expect(result).toEqual({
        ok: true,
        data: 'Token FCM guardado y suscrito a notificaciones_generales',
      });
      expect(database.saveToken).toHaveBeenCalledWith(mockUid, mockToken);
    });
  });

  describe('sendMessage', () => {
    it('debe enviar un mensaje correctamente', async () => {
      const titulo = 'Test Título';
      const body = 'Test Body';
      const fcmToken = 'fcm-token-123';

      (axios.post as jest.Mock).mockResolvedValue({ data: 'ok' });

      await service.sendMessage(titulo, body, fcmToken);

      expect(axios.post).toHaveBeenCalled();
    });
  });

  describe('newInAppNotification', () => {
    it('debe crear una notificación in-app correctamente', async () => {
      const mockNotification = {
        uid: 'user123',
        title: 'Nuevo mensaje',
        body: 'Tienes una nueva notificación',
      };

      database.newInAppNotification.mockResolvedValue('notif123' as any);

      const result = await service.newInAppNotification(mockNotification as any);

      expect(result).toBe('notif123');
      expect(database.newInAppNotification).toHaveBeenCalledWith(mockNotification);
    });

    it('debe retornar false si no hay uid', async () => {
      const mockNotification = {
        title: 'Mensaje sin uid',
        body: 'Test',
      };

      const result = await service.newInAppNotification(mockNotification as any);

      expect(result).toBe(false);
      expect(database.newInAppNotification).not.toHaveBeenCalled();
    });
  });

  describe('deleteInAppNotification', () => {
    it('debe eliminar una notificación correctamente', async () => {
      const mockId = 'notif123';

      database.deleteInAppNotification.mockResolvedValue(true);

      const result = await service.deleteInAppNotification(mockId);

      expect(result).toBe(true);
      expect(database.deleteInAppNotification).toHaveBeenCalledWith(mockId);
    });
  });

  describe('getInAppNotifications', () => {
    it('debe retornar notificaciones de un usuario', async () => {
      const mockUid = 'user123';
      const mockNotifications = [
        { id: '1', title: 'Notificación 1' },
        { id: '2', title: 'Notificación 2' },
      ];

      database.getInAppNotifications.mockResolvedValue(mockNotifications as any);

      const result = await service.getInAppNotifications(mockUid);

      expect(result).toEqual(mockNotifications);
      expect(database.getInAppNotifications).toHaveBeenCalledWith(mockUid);
    });
  });
});
