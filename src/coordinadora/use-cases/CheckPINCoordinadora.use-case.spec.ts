import { Test, TestingModule } from '@nestjs/testing';
import { CheckPINCoordinadoraUseCase } from './CheckPINCoordinadora.use-case';
import { ICoordinadoraRepository } from '../repository/interfaces/ICoordinadora.repository';
import { InternalServerErrorException } from '@nestjs/common';

describe('CheckPINCoordinadoraUseCase', () => {
  let useCase: CheckPINCoordinadoraUseCase;
  let repository: jest.Mocked<ICoordinadoraRepository>;

  beforeEach(async () => {
    const mockRepository = {
      getCoordinadoraPorTienda: jest.fn(),
      getEquipoPorTienda: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CheckPINCoordinadoraUseCase,
          useFactory: () => new CheckPINCoordinadoraUseCase(mockRepository as any),
        },
      ],
    }).compile();

    useCase = module.get<CheckPINCoordinadoraUseCase>(CheckPINCoordinadoraUseCase);
    repository = mockRepository as any;
  });

  describe('execute', () => {
    it('debe retornar true si el PIN coincide con el ID de la coordinadora', async () => {
      const mockCoordinadoraData = {
        principal: {
          id: 1234,
          nombreApellidos: 'María García',
          idTienda: 5,
          idApp: 'app-1234',
        },
        adicionales: [],
      };

      repository.getCoordinadoraPorTienda.mockResolvedValue(mockCoordinadoraData as any);

      const result = await useCase.execute(5, 1234);

      expect(result).toBe(true);
      expect(repository.getCoordinadoraPorTienda).toHaveBeenCalledWith(5);
    });

    it('debe retornar false si el PIN no coincide', async () => {
      const mockCoordinadoraData = {
        principal: {
          id: 1234,
          nombreApellidos: 'María García',
          idTienda: 5,
          idApp: 'app-1234',
        },
        adicionales: [],
      };

      repository.getCoordinadoraPorTienda.mockResolvedValue(mockCoordinadoraData as any);

      const result = await useCase.execute(5, 9999);

      expect(result).toBe(false);
    });

    it('debe lanzar error si no se encuentra la coordinadora', async () => {
      repository.getCoordinadoraPorTienda.mockResolvedValue(null);

      await expect(useCase.execute(5, 1234)).rejects.toThrow(
        InternalServerErrorException
      );
      await expect(useCase.execute(5, 1234)).rejects.toThrow(
        'Coordinadora no encontrada'
      );
    });

    it('debe manejar errores del repositorio', async () => {
      repository.getCoordinadoraPorTienda.mockRejectedValue(
        new Error('Database error')
      );

      await expect(useCase.execute(5, 1234)).rejects.toThrow('Database error');
    });
  });
});
