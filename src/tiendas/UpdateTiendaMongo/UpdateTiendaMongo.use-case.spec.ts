import { Test, TestingModule } from '@nestjs/testing';
import { UpdateTiendaMongoUseCase } from './UpdateTiendaMongo.use-case';
import { ITiendaMongoRepository } from '../repository/ITiendaAtenea.repository';
import { ObjectId } from 'mongodb';

describe('UpdateTiendaMongoUseCase', () => {
  let useCase: UpdateTiendaMongoUseCase;
  let repository: ITiendaMongoRepository;

  const mockRepository = {
    createTienda: jest.fn(),
    getTiendasAtenea: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTiendaMongoUseCase,
        {
          provide: ITiendaMongoRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateTiendaMongoUseCase>(UpdateTiendaMongoUseCase);
    repository = module.get<ITiendaMongoRepository>(ITiendaMongoRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should update a tienda successfully', async () => {
      const mockId = new ObjectId();
      const mockPayload = {
        _id: mockId.toString(),
        name: 'Tienda Updated',
        address: 'Calle Nueva 456',
        city: 'Madrid',
        latitude: 40.4168,
        longitude: -3.7038,
        municipalityCode: 28079,
        phone: '987654321',
        postalCode: '28001',
        province: 'Madrid',
        type: 'Franquicia' as const,
      };

      mockRepository.update.mockResolvedValue(undefined);

      await useCase.execute(mockPayload._id, mockPayload);

      expect(mockRepository.update).toHaveBeenCalledWith(expect.any(ObjectId), mockPayload);
      expect(mockRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should handle repository errors', async () => {
      const mockId = new ObjectId();
      const mockPayload = {
        _id: mockId.toString(),
        name: 'Tienda Updated',
      };

      const error = new Error('Database error');
      mockRepository.update.mockRejectedValue(error);

      await expect(useCase.execute(mockPayload._id, mockPayload)).rejects.toThrow('Database error');
    });

    it('should convert string _id to ObjectId', async () => {
      const mockId = new ObjectId();
      const mockPayload = {
        _id: mockId.toString(),
        name: 'Tienda Test',
      };

      mockRepository.update.mockResolvedValue(undefined);

      await useCase.execute(mockPayload._id, mockPayload);

      expect(mockRepository.update).toHaveBeenCalledWith(
        expect.any(ObjectId),
        mockPayload
      );
    });
  });
});
