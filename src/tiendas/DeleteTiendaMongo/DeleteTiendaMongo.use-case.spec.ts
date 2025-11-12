import { Test, TestingModule } from '@nestjs/testing';
import { DeleteTiendaMongoUseCase } from './DeleteTiendaMongo.use-case';
import { ITiendaMongoRepository } from '../repository/ITiendaAtenea.repository';
import { DeleteResult, ObjectId } from 'mongodb';

describe('DeleteTiendaMongoUseCase', () => {
  let useCase: DeleteTiendaMongoUseCase;
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
        DeleteTiendaMongoUseCase,
        {
          provide: ITiendaMongoRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteTiendaMongoUseCase>(DeleteTiendaMongoUseCase);
    repository = module.get<ITiendaMongoRepository>(ITiendaMongoRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should delete a tienda successfully', async () => {
      const mockId = new ObjectId();
      const mockResult: DeleteResult = {
        acknowledged: true,
        deletedCount: 1,
      };

      mockRepository.delete.mockResolvedValue(mockResult);

      const result = await useCase.execute(mockId.toString());

      expect(result).toEqual(mockResult);
      expect(mockRepository.delete).toHaveBeenCalledWith(expect.any(ObjectId));
      expect(mockRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should handle repository errors', async () => {
      const mockId = new ObjectId();
      const error = new Error('Database error');

      mockRepository.delete.mockRejectedValue(error);

      await expect(useCase.execute(mockId.toString())).rejects.toThrow('Database error');
      expect(mockRepository.delete).toHaveBeenCalledWith(expect.any(ObjectId));
    });

    it('should convert string _id to ObjectId', async () => {
      const mockId = new ObjectId();
      const mockResult: DeleteResult = {
        acknowledged: true,
        deletedCount: 1,
      };

      mockRepository.delete.mockResolvedValue(mockResult);

      await useCase.execute(mockId.toString());

      const call = mockRepository.delete.mock.calls[0][0];
      expect(call).toBeInstanceOf(ObjectId);
      expect(call.toString()).toBe(mockId.toString());
    });

    it('should return deletedCount 0 when tienda not found', async () => {
      const mockId = new ObjectId();
      const mockResult: DeleteResult = {
        acknowledged: true,
        deletedCount: 0,
      };

      mockRepository.delete.mockResolvedValue(mockResult);

      const result = await useCase.execute(mockId.toString());

      expect(result.deletedCount).toBe(0);
    });
  });
});
