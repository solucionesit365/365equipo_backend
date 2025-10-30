import { Test, TestingModule } from '@nestjs/testing';
import { GetTiendasDelSupervisor } from './GetTiendasDelSupervisor.use-case';
import { ISubordinadoRepository } from '../../subordinado/repository/ISubordinado.repository';
import { RoleService } from '../../role/role.service';
import { Tienda } from '../../tiendas/tiendas.class';

describe('GetTiendasDelSupervisor', () => {
  let useCase: GetTiendasDelSupervisor;
  let subordinadoRepository: jest.Mocked<ISubordinadoRepository>;
  let roleService: jest.Mocked<RoleService>;
  let tiendaService: jest.Mocked<Tienda>;

  beforeEach(async () => {
    const mockSubordinadoRepository = {
      getSubordinados: jest.fn(),
    };

    const mockRoleService = {
      hasRole: jest.fn(),
    };

    const mockTiendaService = {
      getTiendas: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GetTiendasDelSupervisor,
          useFactory: () =>
            new GetTiendasDelSupervisor(
              mockSubordinadoRepository as any,
              mockRoleService as any,
              mockTiendaService as any,
            ),
        },
      ],
    }).compile();

    useCase = module.get<GetTiendasDelSupervisor>(GetTiendasDelSupervisor);
    subordinadoRepository = mockSubordinadoRepository as any;
    roleService = mockRoleService as any;
    tiendaService = mockTiendaService as any;
  });

  describe('execute', () => {
    it('debe retornar todas las tiendas si es Super_Admin', async () => {
      const idSupervisor = 1;
      const mockTiendas = [
        { id: 1, nombre: 'Tienda 1' },
        { id: 2, nombre: 'Tienda 2' },
      ];

      roleService.hasRole.mockReturnValue(Promise.resolve(true) as any);
      tiendaService.getTiendas.mockResolvedValue(mockTiendas as any);

      const result = await useCase.execute(idSupervisor);

      expect(result).toEqual(mockTiendas);
      expect(roleService.hasRole).toHaveBeenCalledWith(1, 'Super_Admin');
      expect(tiendaService.getTiendas).toHaveBeenCalled();
    });

    it('debe retornar tiendas de subordinados sin duplicados', async () => {
      const idSupervisor = 2;
      const mockSubordinados = [
        { id: 10, tienda: { id: 1, nombre: 'Tienda 1' } },
        { id: 11, tienda: { id: 2, nombre: 'Tienda 2' } },
        { id: 12, tienda: { id: 1, nombre: 'Tienda 1' } }, // Duplicado
      ];

      roleService.hasRole.mockReturnValue(Promise.resolve(false) as any);
      subordinadoRepository.getSubordinados.mockResolvedValue(mockSubordinados as any);

      const result = await useCase.execute(idSupervisor);

      expect(result).toHaveLength(2);
      expect(result.map((t) => t.id)).toEqual([1, 2]);
    });

    it('debe retornar array vacío si no hay subordinados', async () => {
      const idSupervisor = 3;

      roleService.hasRole.mockReturnValue(Promise.resolve(false) as any);
      subordinadoRepository.getSubordinados.mockResolvedValue([]);

      const result = await useCase.execute(idSupervisor);

      expect(result).toEqual([]);
    });

    it('debe filtrar subordinados sin tienda', async () => {
      const idSupervisor = 4;
      const mockSubordinados = [
        { id: 10, tienda: { id: 1, nombre: 'Tienda 1' } },
        { id: 11, tienda: null },
        { id: 12, tienda: undefined },
      ];

      roleService.hasRole.mockReturnValue(Promise.resolve(false) as any);
      subordinadoRepository.getSubordinados.mockResolvedValue(mockSubordinados as any);

      const result = await useCase.execute(idSupervisor);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });
  });
});
