import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from './logger.service';
import { MongoService } from '../mongo/mongo.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('LoggerService', () => {
  let service: LoggerService;
  let mongoService: jest.Mocked<MongoService>;

  const mockCollection = {
    insertOne: jest.fn(),
    find: jest.fn(),
  };

  const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollection),
  };

  const mockConnection = {
    db: jest.fn().mockReturnValue(mockDb),
  };

  beforeEach(async () => {
    const mockMongoService = {
      getConexion: jest.fn().mockResolvedValue(mockConnection),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        { provide: MongoService, useValue: mockMongoService },
      ],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
    mongoService = module.get(MongoService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear un log correctamente', async () => {
      const logData = {
        name: 'Test User',
        action: 'Test Action',
        extraData: { test: 'data' },
      };

      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      await service.create(logData);

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'Test Action',
          name: 'Test User',
          extraData: { test: 'data' },
          datetime: expect.any(Date),
        }),
      );
    });

    it('debe lanzar error si falta name', async () => {
      const logData = {
        name: '',
        action: 'Test Action',
      };

      await expect(service.create(logData)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('debe lanzar error si falta action', async () => {
      const logData = {
        name: 'Test User',
        action: '',
      };

      await expect(service.create(logData)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getLogs', () => {
    it('debe retornar todos los logs', async () => {
      const mockLogs = [
        { action: 'Action 1', name: 'User 1', datetime: new Date() },
        { action: 'Action 2', name: 'User 2', datetime: new Date() },
      ];

      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockLogs),
      });

      const result = await service.getLogs();

      expect(result).toEqual(mockLogs);
    });

    it('debe lanzar error si falla la obtención', async () => {
      mockCollection.find.mockImplementation(() => {
        throw new Error('DB Error');
      });

      await expect(service.getLogs()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
