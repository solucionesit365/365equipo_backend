import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.class';
import { ChatDatabase } from './chat.mongodb';

describe('ChatService', () => {
  let service: ChatService;
  let mockChatDatabase: any;

  beforeEach(async () => {
    mockChatDatabase = {
      getMessagesByContact: jest.fn(),
      saveMessage: jest.fn(),
      markMessageAsRead: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: ChatDatabase,
          useValue: mockChatDatabase,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMessagesByContact', () => {
    it('debe retornar mensajes de un contacto', async () => {
      const mockMessages = [
        { _id: '1', text: 'Hola', contactId: 100 },
        { _id: '2', text: 'Adiós', contactId: 100 },
      ];

      mockChatDatabase.getMessagesByContact.mockResolvedValue(mockMessages);

      const result = await service.getMessagesByContact(100);

      expect(result).toEqual(mockMessages);
      expect(mockChatDatabase.getMessagesByContact).toHaveBeenCalledWith(100);
    });

    it('debe retornar array vacío si no hay mensajes', async () => {
      mockChatDatabase.getMessagesByContact.mockResolvedValue([]);

      const result = await service.getMessagesByContact(999);

      expect(result).toEqual([]);
    });
  });

  describe('saveMessage', () => {
    it('debe guardar un mensaje y asignar createdAt', async () => {
      const mensaje = {
        text: 'Nuevo mensaje',
        contactId: 100,
        senderId: 1,
      };

      mockChatDatabase.saveMessage.mockResolvedValue({ insertedId: '123' });

      const beforeCall = new Date();
      const result = await service.saveMessage(mensaje as any);
      const afterCall = new Date();

      expect(result).toEqual({ insertedId: '123' });
      expect(mockChatDatabase.saveMessage).toHaveBeenCalled();

      const calledMessage = mockChatDatabase.saveMessage.mock.calls[0][0];
      expect(calledMessage.createdAt).toBeInstanceOf(Date);
      expect(calledMessage.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
      expect(calledMessage.createdAt.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });

    it('debe sobrescribir createdAt si ya existía', async () => {
      const mensaje = {
        text: 'Mensaje con fecha',
        contactId: 100,
        senderId: 1,
        createdAt: new Date('2020-01-01'),
      };

      mockChatDatabase.saveMessage.mockResolvedValue({ insertedId: '123' });

      await service.saveMessage(mensaje as any);

      const calledMessage = mockChatDatabase.saveMessage.mock.calls[0][0];
      expect(calledMessage.createdAt.getTime()).not.toBe(new Date('2020-01-01').getTime());
    });
  });

  describe('markMessageAsRead', () => {
    it('debe marcar mensajes como leídos', async () => {
      const mensajes = { ids: ['1', '2', '3'] };

      mockChatDatabase.markMessageAsRead.mockResolvedValue({ modifiedCount: 3 });

      const result = await service.markMessageAsRead(mensajes);

      expect(result).toEqual({ modifiedCount: 3 });
      expect(mockChatDatabase.markMessageAsRead).toHaveBeenCalledWith(mensajes);
    });

    it('debe manejar array vacío de ids', async () => {
      const mensajes = { ids: [] };

      mockChatDatabase.markMessageAsRead.mockResolvedValue({ modifiedCount: 0 });

      const result = await service.markMessageAsRead(mensajes);

      expect(result).toEqual({ modifiedCount: 0 });
    });
  });
});
