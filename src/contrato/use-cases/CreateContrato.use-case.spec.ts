import { Test, TestingModule } from '@nestjs/testing';
import { CreateContratoUseCase } from './CreateContrato.use-case';
import { IContratoRepository } from '../repository/interfaces/IContrato.repository';

describe('CreateContratoUseCase', () => {
  let useCase: CreateContratoUseCase;
  let repository: jest.Mocked<IContratoRepository>;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findActiveByTrabajadorId: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CreateContratoUseCase,
          useFactory: () => new CreateContratoUseCase(mockRepository as any),
        },
      ],
    }).compile();

    useCase = module.get<CreateContratoUseCase>(CreateContratoUseCase);
    repository = mockRepository as any;
  });

  describe('execute', () => {
    it('debe crear un contrato nuevo sin contrato activo previo', async () => {
      const mockContrato = {
        idTrabajador: 1,
        fechaAlta: new Date('2024-01-01'),
        tipoContrato: 'Indefinido',
        jornada: 40,
      };

      const mockCreatedContrato = {
        id: 1,
        ...mockContrato,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.findActiveByTrabajadorId.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockCreatedContrato as any);

      const result = await useCase.execute(mockContrato as any);

      expect(result).toEqual(mockCreatedContrato);
      expect(repository.findActiveByTrabajadorId).toHaveBeenCalledWith(1);
      expect(repository.create).toHaveBeenCalledWith(mockContrato);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('debe cerrar contrato activo previo antes de crear uno nuevo', async () => {
      const mockContrato = {
        idTrabajador: 1,
        fechaAlta: new Date('2024-01-01'),
        tipoContrato: 'Indefinido',
        jornada: 40,
      };

      const mockContratoActivo = {
        id: 10,
        idTrabajador: 1,
        fechaAlta: new Date('2023-01-01'),
        fechaBaja: null,
      };

      const mockCreatedContrato = {
        id: 2,
        ...mockContrato,
      };

      repository.findActiveByTrabajadorId.mockResolvedValue(mockContratoActivo as any);
      repository.update.mockResolvedValue({ ...mockContratoActivo, fechaBaja: new Date() } as any);
      repository.create.mockResolvedValue(mockCreatedContrato as any);

      const result = await useCase.execute(mockContrato as any);

      expect(result).toEqual(mockCreatedContrato);
      expect(repository.update).toHaveBeenCalledWith(10, {
        fechaBaja: expect.any(Date),
        finalContrato: expect.any(Date),
      });
      expect(repository.create).toHaveBeenCalledWith(mockContrato);
    });

    it('debe manejar errores de repositorio', async () => {
      const mockContrato = {
        idTrabajador: 1,
        fechaAlta: new Date('2024-01-01'),
      };

      repository.findActiveByTrabajadorId.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(mockContrato as any)).rejects.toThrow('Database error');
    });
  });
});
