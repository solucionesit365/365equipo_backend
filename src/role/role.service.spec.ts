import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RoleService', () => {
  let service: RoleService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrismaService = {
      role: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    prisma = module.get(PrismaService) as any;
  });

  describe('createRole', () => {
    it('debe crear un rol correctamente', async () => {
      const roleData = {
        name: 'Admin',
      };

      const mockRole = {
        id: '1',
        name: 'Admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.role.create as jest.Mock).mockResolvedValue(mockRole);

      const result = await service.createRole(roleData);

      expect(result).toEqual(mockRole);
      expect(prisma.role.create).toHaveBeenCalledWith({
        data: { name: 'Admin' },
      });
    });
  });

  describe('getRoles', () => {
    it('debe retornar todos los roles', async () => {
      const mockRoles = [
        { id: '1', name: 'Admin', permissions: [] },
        { id: '2', name: 'User', permissions: [] },
      ];

      (prisma.role.findMany as jest.Mock).mockResolvedValue(mockRoles);

      const result = await service.getRoles();

      expect(result).toEqual(mockRoles);
      expect(prisma.role.findMany).toHaveBeenCalledWith({
        include: { permissions: true },
      });
    });
  });

  describe('getRoleById', () => {
    it('debe retornar un rol por ID', async () => {
      const mockRole = {
        id: '1',
        name: 'Admin',
        permissions: [],
      };

      (prisma.role.findUnique as jest.Mock).mockResolvedValue(mockRole);

      const result = await service.getRoleById('1');

      expect(result).toEqual(mockRole);
      expect(prisma.role.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { permissions: true },
      });
    });
  });

  describe('deleteRole', () => {
    it('debe eliminar un rol correctamente', async () => {
      const mockRole = { id: '1', name: 'Admin' };

      (prisma.role.delete as jest.Mock).mockResolvedValue(mockRole);

      const result = await service.deleteRole('1');

      expect(result).toEqual(mockRole);
      expect(prisma.role.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });

  describe('addPermission', () => {
    it('debe agregar un permiso a un rol', async () => {
      const permissionData = {
        roleId: '1',
        permissionId: 'perm1',
      };

      const mockRole = {
        id: '1',
        name: 'Admin',
        permissions: [{ id: 'perm1' }],
      };

      (prisma.role.update as jest.Mock).mockResolvedValue(mockRole);

      const result = await service.addPermission(permissionData);

      expect(result).toEqual(mockRole);
      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          permissions: {
            connect: { id: 'perm1' },
          },
        },
      });
    });
  });
});
