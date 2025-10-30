import { Test, TestingModule } from '@nestjs/testing';
import { GetTiendasUseCase } from './GetTiendas.use-case';
import { ITiendaRepository } from '../repository/ITienda.repository';

describe('GetTiendasUseCase', () => {
  let useCase: GetTiendasUseCase;
  let repository: jest.Mocked<ITiendaRepository>;

  beforeEach(async () => {
    const mockRepository = {
      getTiendas: jest.fn(),
      getTiendaById: jest.fn(),
      createTienda: jest.fn(),
      updateTienda: jest.fn(),
      deleteTienda: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GetTiendasUseCase,
          useFactory: () => new GetTiendasUseCase(mockRepository as any),
        },
      ],
    }).compile();

    useCase = module.get<GetTiendasUseCase>(GetTiendasUseCase);
    repository = mockRepository as any;
  });

  describe('execute', () => {
    it('debe retornar todas las tiendas', async () => {
      const mockTiendas = [
        {
          id: 1,
          nombre: 'Tienda Centro',
          direccion: 'Calle Principal 123',
          ciudad: 'Madrid',
          codigoPostal: '28001',
          telefono: '912345678',
          empresaId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          nombre: 'Tienda Norte',
          direccion: 'Avenida Norte 456',
          ciudad: 'Madrid',
          codigoPostal: '28050',
          telefono: '912345679',
          empresaId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      repository.getTiendas.mockResolvedValue(mockTiendas as any);

      const result = await useCase.execute();

      expect(result).toEqual(mockTiendas);
      expect(repository.getTiendas).toHaveBeenCalled();
    });

    it('debe retornar array vacío si no hay tiendas', async () => {
      repository.getTiendas.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result).toEqual([]);
      expect(repository.getTiendas).toHaveBeenCalled();
    });

    it('debe manejar errores del repositorio', async () => {
      repository.getTiendas.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute()).rejects.toThrow('Database error');
    });
  });
});
