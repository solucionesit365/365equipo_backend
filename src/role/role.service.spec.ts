import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { PrismaService } from '../prisma/prisma.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('RoleService', () => {
  let service: RoleService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrismaService = {
      role: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
      },
      trabajador: {
        findUnique: jest.fn(),
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

    it('debe retornar null cuando no existe el rol', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.getRoleById('999');

      expect(result).toBeNull();
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

  describe('removePermission', () => {
    it('debe remover un permiso de un rol', async () => {
      const permissionData = {
        roleId: '1',
        permissionId: 'perm1',
      };

      const mockRole = {
        id: '1',
        name: 'Admin',
        permissions: [],
      };

      (prisma.role.update as jest.Mock).mockResolvedValue(mockRole);

      const result = await service.removePermission(permissionData);

      expect(result).toEqual(mockRole);
      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          permissions: {
            disconnect: { id: 'perm1' },
          },
        },
      });
    });
  });

  describe('findRoleByName', () => {
    it('debe encontrar un rol por nombre', async () => {
      const mockRole = { id: '1', name: 'Admin', permissions: [] };

      (prisma.role.findFirst as jest.Mock).mockResolvedValue(mockRole);

      const result = await service.findRoleByName('Admin');

      expect(result).toEqual(mockRole);
      expect(prisma.role.findFirst).toHaveBeenCalledWith({
        where: { name: 'Admin' },
        include: { permissions: true },
      });
    });

    it('debe retornar null cuando no existe el rol', async () => {
      (prisma.role.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.findRoleByName('NonExistent');

      expect(result).toBeNull();
    });
  });

  describe('getUserRoles', () => {
    it('debe retornar los roles de un trabajador', async () => {
      const mockTrabajador = {
        id: 1,
        roles: [{ id: '1', name: 'Admin' }],
      };

      (prisma.trabajador.findUnique as jest.Mock).mockResolvedValue(mockTrabajador);

      const result = await service.getUserRoles(1);

      expect(result).toEqual(mockTrabajador);
      expect(prisma.trabajador.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { roles: true },
      });
    });

    it('debe lanzar InternalServerErrorException cuando hay error', async () => {
      (prisma.trabajador.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.getUserRoles(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('hasRole', () => {
    it('debe retornar true cuando el trabajador tiene el rol por id', async () => {
      const mockTrabajador = {
        id: 1,
        roles: [{ id: 'role-1', name: 'Admin' }],
      };

      (prisma.trabajador.findUnique as jest.Mock).mockResolvedValue(mockTrabajador);

      const result = await service.hasRole(1, 'role-1');

      expect(result).toBe(true);
    });

    it('debe retornar true cuando el trabajador tiene el rol por nombre', async () => {
      const mockTrabajador = {
        id: 1,
        roles: [{ id: 'role-1', name: 'Admin' }],
      };

      (prisma.trabajador.findUnique as jest.Mock).mockResolvedValue(mockTrabajador);

      const result = await service.hasRole(1, 'Admin');

      expect(result).toBe(true);
    });

    it('debe retornar false cuando el trabajador no tiene el rol', async () => {
      const mockTrabajador = {
        id: 1,
        roles: [{ id: 'role-1', name: 'User' }],
      };

      (prisma.trabajador.findUnique as jest.Mock).mockResolvedValue(mockTrabajador);

      const result = await service.hasRole(1, 'Admin');

      expect(result).toBe(false);
    });

    it('debe retornar false cuando el trabajador no existe', async () => {
      (prisma.trabajador.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.hasRole(999, 'Admin');

      expect(result).toBe(false);
    });

    it('debe retornar false cuando el trabajador no tiene roles', async () => {
      const mockTrabajador = {
        id: 1,
        roles: [],
      };

      (prisma.trabajador.findUnique as jest.Mock).mockResolvedValue(mockTrabajador);

      const result = await service.hasRole(1, 'Admin');

      expect(result).toBe(false);
    });

    it('debe lanzar InternalServerErrorException cuando hay error', async () => {
      (prisma.trabajador.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.hasRole(1, 'Admin')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
