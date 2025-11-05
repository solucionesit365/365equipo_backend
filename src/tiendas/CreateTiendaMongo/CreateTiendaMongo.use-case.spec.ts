import { Test, TestingModule } from '@nestjs/testing';
import { CreateTiendaMongoUseCase } from './CreateTiendaMongo.use-case';
import { ITiendaMongoRepository } from '../repository/ITiendaAtenea.repository';
import { InsertOneResult, ObjectId } from 'mongodb';

describe('CreateTiendaMongoUseCase', () => {
  let useCase: CreateTiendaMongoUseCase;
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
        CreateTiendaMongoUseCase,
        {
          provide: ITiendaMongoRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateTiendaMongoUseCase>(CreateTiendaMongoUseCase);
    repository = module.get<ITiendaMongoRepository>(ITiendaMongoRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should create a tienda successfully', async () => {
      const mockTienda = {
        id: 1,
        idExterno: 100,
        name: 'Tienda Test',
        address: 'Calle Test 123',
        city: 'Barcelona',
        latitude: 41.3851,
        longitude: 2.1734,
        municipalityCode: 8019,
        phone: '912345678',
        postalCode: '08001',
        province: 'Barcelona',
        type: 'Propia' as const,
      };

      const mockResult: InsertOneResult = {
        acknowledged: true,
        insertedId: new ObjectId(),
      };

      mockRepository.createTienda.mockResolvedValue(mockResult);

      const result = await useCase.execute(mockTienda);

      expect(result).toEqual(mockResult);
      expect(mockRepository.createTienda).toHaveBeenCalledWith(mockTienda);
      expect(mockRepository.createTienda).toHaveBeenCalledTimes(1);
    });

    it('should handle repository errors', async () => {
      const mockTienda = {
        id: 1,
        idExterno: 100,
        name: 'Tienda Test',
        address: 'Calle Test 123',
        city: 'Barcelona',
        latitude: 41.3851,
        longitude: 2.1734,
        municipalityCode: 8019,
        phone: '912345678',
        postalCode: '08001',
        province: 'Barcelona',
        type: 'Propia' as const,
      };

      const error = new Error('Database error');
      mockRepository.createTienda.mockRejectedValue(error);

      await expect(useCase.execute(mockTienda)).rejects.toThrow('Database error');
      expect(mockRepository.createTienda).toHaveBeenCalledWith(mockTienda);
    });
  });
});
