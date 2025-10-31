import { Test, TestingModule } from '@nestjs/testing';
import { GetTiendasAteneaUseCase } from './GetTiendasAtenea.use-case';
import { ITiendaAteneaRepository } from '../repository/ITiendaAtenea.repository';
import { Tiendas2 } from '../tiendas.dto';

describe('GetTiendasAteneaUseCase', () => {
  let useCase: GetTiendasAteneaUseCase;
  let repository: jest.Mocked<ITiendaAteneaRepository>;

  beforeEach(async () => {
    const mockRepository = {
      getTiendasAtenea: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GetTiendasAteneaUseCase,
          useFactory: () => new GetTiendasAteneaUseCase(mockRepository as any),
        },
      ],
    }).compile();

    useCase = module.get<GetTiendasAteneaUseCase>(GetTiendasAteneaUseCase);
    repository = mockRepository as any;
  });

  describe('execute', () => {
    it('debe retornar todas las tiendas de Atenea', async () => {
      const mockTiendas: Tiendas2[] = [
        {
          direccion: 'Calle Principal 123',
          postalCode: '28001',
          city: 'Madrid',
          province: 'Madrid',
          municipalityCode: 28079,
          nombre: 'Tienda Centro',
          latitude: 40.4168,
          longitude: -3.7038,
          Tipo: 'TIENDA',
          coordinatorId: 1,
          id: 1,
          idExterno: 101,
          telefono: 912345678,
          existsBC: true,
        },
        {
          direccion: 'Avenida Norte 456',
          postalCode: '28050',
          city: 'Madrid',
          province: 'Madrid',
          municipalityCode: 28079,
          nombre: 'Tienda Norte',
          latitude: 40.4500,
          longitude: -3.7000,
          Tipo: 'TIENDA',
          coordinatorId: 2,
          id: 2,
          idExterno: 102,
          telefono: 912345679,
          existsBC: false,
        },
      ];

      repository.getTiendasAtenea.mockResolvedValue(mockTiendas);

      const result = await useCase.execute();

      expect(result).toEqual(mockTiendas);
      expect(repository.getTiendasAtenea).toHaveBeenCalled();
    });

    it('debe retornar array vacío si no hay tiendas', async () => {
      repository.getTiendasAtenea.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result).toEqual([]);
      expect(repository.getTiendasAtenea).toHaveBeenCalled();
    });

    it('debe manejar errores del repositorio', async () => {
      repository.getTiendasAtenea.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute()).rejects.toThrow('Database error');
    });

    it('debe retornar tiendas con información completa de MongoDB', async () => {
      const mockTiendasCompletas: Tiendas2[] = [
        {
          direccion: 'Calle Test 789',
          postalCode: '08001',
          city: 'Barcelona',
          province: 'Barcelona',
          municipalityCode: 8019,
          nombre: 'Tienda Barcelona',
          latitude: 41.3851,
          longitude: 2.1734,
          Tipo: 'TIENDA',
          coordinatorId: 3,
          id: 3,
          idExterno: 103,
          telefono: 934567890,
          existsBC: true,
        },
      ];

      repository.getTiendasAtenea.mockResolvedValue(mockTiendasCompletas);

      const result = await useCase.execute();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('postalCode');
      expect(result[0]).toHaveProperty('city');
      expect(result[0]).toHaveProperty('province');
      expect(result[0]).toHaveProperty('latitude');
      expect(result[0]).toHaveProperty('longitude');
      expect(result[0]).toHaveProperty('Tipo');
      expect(repository.getTiendasAtenea).toHaveBeenCalled();
    });
  });
});
